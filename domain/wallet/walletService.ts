import { getDatabase } from '../../db/client';
import { seedInitialWallet } from '../../db/seed';
import { generateUUID } from '../../utils/uuid';
import { getThemeIdForWalletType } from '../../utils/walletImages';
import type { Wallet, WalletType } from '../../types/wallet';
import { deleteAllTransactions, deleteTransactionsByWalletId } from '../transaction/transactionRepository';
import {
  countWallets,
  createWallet as createWalletRecord,
  deleteAllWallets,
  deleteWallet as deleteWalletRecord,
  updateWalletsDisplayOrder,
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
    id: generateUUID(),
    name: name.trim(),
    type,
    themeId: getThemeIdForWalletType(type),
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  await createWalletRecord(wallet);
  return wallet;
}

export async function reorderWallets(wallets: import('../../types/wallet').Wallet[]): Promise<void> {
  await updateWalletsDisplayOrder(wallets.map(w => w.id));
}

export async function resetAllData(): Promise<void> {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await deleteAllTransactions();
    await deleteAllWallets();
  });
  await seedInitialWallet(db);
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
