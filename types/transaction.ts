export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  walletId: string;
  walletName: string; // 財布削除後も履歴文言が成立するよう非正規化で保持
  type: TransactionType;
  amount: number;
  createdAt: string; // ISO8601
}
