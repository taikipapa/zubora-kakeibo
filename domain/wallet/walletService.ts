import { getDatabase } from '../../db/client';
import type { Wallet, WalletType } from '../../types/wallet';
import { deleteTransactionsByWalletId } from '../transaction/transactionRepository';
import {
  countWallets,
  createWallet as createWalletRecord,
  deleteWallet as deleteWalletRecord,
} from './walletRepository';

const MAX_WALLETS = 5;
const MIN_WALLETS = 1;

export async function createWallet(name: string, type: WalletType): Promise<Wallet> {
  if (!name.trim()) {
    throw new Error('財布名を入力してください');
  }
  const count = await countWallets();
  if (count >= MAX_WALLETS) {
    throw new Error(`財布は最大${MAX_WALLETS}個まで作成できます`);
  }
  const wallet: Wallet = {
    id: crypto.randomUUID(),
    name: name.trim(),
    type,
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  await createWalletRecord(wallet);
  return wallet;
}

export async function deleteWallet(id: string): Promise<void> {
  const count = await countWallets();
  if (count <= MIN_WALLETS) {
    throw new Error('最後の財布は削除できません');
  }
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await deleteTransactionsByWalletId(id);
    await deleteWalletRecord(id);
  });
}
