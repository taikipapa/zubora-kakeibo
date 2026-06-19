export type WalletType = 'gamaguchi' | 'kinchaku' | 'long' | 'folding';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  createdAt: string; // ISO8601
}
