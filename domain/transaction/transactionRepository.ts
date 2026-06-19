import { getDatabase } from '../../db/client';
import type { Transaction } from '../../types/transaction';

export function getAllTransactions(): Promise<Transaction[]> {
  const db = getDatabase();
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY createdAt DESC',
  );
}

export function getTransactionById(id: string): Promise<Transaction | null> {
  const db = getDatabase();
  return db.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?',
    [id],
  );
}

export async function createTransaction(transaction: Transaction): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO transactions (id, walletId, walletName, type, amount, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [
      transaction.id,
      transaction.walletId,
      transaction.walletName,
      transaction.type,
      transaction.amount,
      transaction.createdAt,
    ],
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export function getRecentTransactionsByWalletId(
  walletId: string,
  limit: number,
): Promise<Transaction[]> {
  const db = getDatabase();
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE walletId = ? ORDER BY createdAt DESC LIMIT ?',
    [walletId, limit],
  );
}

export async function deleteTransactionsByWalletId(walletId: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE walletId = ?', [walletId]);
}
