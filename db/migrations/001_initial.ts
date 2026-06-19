import type { SQLiteDatabase } from 'expo-sqlite';

import { CREATE_TRANSACTIONS_TABLE, CREATE_WALLETS_TABLE } from '../schema';

export async function runInitialMigration(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_WALLETS_TABLE);
  await db.execAsync(CREATE_TRANSACTIONS_TABLE);

  // Add themeId column (safe: ignored if already present)
  try {
    await db.execAsync(`ALTER TABLE wallets ADD COLUMN themeId TEXT NOT NULL DEFAULT 'waiwai'`);
  } catch { /* already exists */ }
  await db.execAsync(`UPDATE wallets SET themeId = 'waiwai' WHERE themeId IS NULL OR themeId = ''`);

  // Add displayOrder column (safe: ignored if already present)
  try {
    await db.execAsync(`ALTER TABLE wallets ADD COLUMN displayOrder INTEGER NOT NULL DEFAULT 0`);
  } catch { /* already exists */ }
  // Initialize displayOrder for existing rows based on rowid (approximates creation order)
  await db.execAsync(`
    UPDATE wallets SET displayOrder = (
      SELECT COUNT(*) FROM wallets w2 WHERE w2.rowid < wallets.rowid
    )
    WHERE displayOrder = 0 AND (SELECT COUNT(*) FROM wallets) > 1
  `);
}
