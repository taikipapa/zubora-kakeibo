import type { SQLiteDatabase } from 'expo-sqlite';

import { CREATE_TRANSACTIONS_TABLE, CREATE_WALLETS_TABLE } from '../schema';

export async function runInitialMigration(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_WALLETS_TABLE);
  await db.execAsync(CREATE_TRANSACTIONS_TABLE);
}
