import { getDatabase } from '../../db/client';
import { generateUUID } from '../../utils/uuid';
import type { TransactionType } from '../../types/transaction';
import { getWalletById, updateWalletBalance } from '../wallet/walletRepository';
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
} from './transactionRepository';

export async function addTransaction(
  walletId: string,
  type: TransactionType,
  amount: number,
): Promise<void> {
  if (amount <= 0) {
    throw new Error('金額は1円以上を入力してください');
  }
  const wallet = await getWalletById(walletId);
  if (!wallet) {
    throw new Error('財布が見つかりません');
  }
  const newBalance = type === 'income' ? wallet.balance + amount : wallet.balance - amount;
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await updateWalletBalance(walletId, newBalance);
    await createTransaction({
      id: generateUUID(),
      walletId,
      walletName: wallet.name,
      type,
      amount,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function removeTransaction(id: string): Promise<void> {
  const transaction = await getTransactionById(id);
  if (!transaction) {
    throw new Error('履歴が見つかりません');
  }
  const wallet = await getWalletById(transaction.walletId);
  // 設計書12章: 財布が存在しない場合は残高復元をスキップして履歴のみ削除
  if (!wallet) {
    await deleteTransaction(id);
    return;
  }
  const restoredBalance =
    transaction.type === 'income'
      ? wallet.balance - transaction.amount
      : wallet.balance + transaction.amount;
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await updateWalletBalance(transaction.walletId, restoredBalance);
    await deleteTransaction(id);
  });
}
