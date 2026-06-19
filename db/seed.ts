import type { SQLiteDatabase } from 'expo-sqlite';

import { generateUUID } from '../utils/uuid';

export async function seedInitialWallet(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM wallets',
  );
  if ((result?.count ?? 0) > 0) return;

  await db.runAsync(
    'INSERT INTO wallets (id, name, type, themeId, balance, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [generateUUID(), 'ズボラ財布', 'gamaguchi', 'waiwai', 0, new Date().toISOString()],
  );
}
