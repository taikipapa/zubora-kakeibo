import type { ThemeId } from './settings';

export type WalletType = 'gamaguchi' | 'kinchaku' | 'long' | 'folding';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  themeId: ThemeId;
  balance: number;
  createdAt: string; // ISO8601
}
