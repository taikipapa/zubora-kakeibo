import { getDatabase } from '../../db/client';
import type { Wallet } from '../../types/wallet';

export function getAllWallets(): Promise<Wallet[]> {
  const db = getDatabase();
  return db.getAllAsync<Wallet>('SELECT * FROM wallets ORDER BY createdAt ASC');
}

export function getWalletById(id: string): Promise<Wallet | null> {
  const db = getDatabase();
  return db.getFirstAsync<Wallet>('SELECT * FROM wallets WHERE id = ?', [id]);
}

export async function createWallet(wallet: Wallet): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO wallets (id, name, type, balance, createdAt) VALUES (?, ?, ?, ?, ?)',
    [wallet.id, wallet.name, wallet.type, wallet.balance, wallet.createdAt],
  );
}

export async function updateWalletBalance(id: string, balance: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync('UPDATE wallets SET balance = ? WHERE id = ?', [balance, id]);
}

export async function deleteWallet(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM wallets WHERE id = ?', [id]);
}

export async function deleteAllWallets(): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM wallets');
}

export async function countWallets(): Promise<number> {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM wallets',
  );
  return result?.count ?? 0;
}
