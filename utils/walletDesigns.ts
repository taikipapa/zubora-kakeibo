import type { ThemeId } from '../types/settings';
import type { WalletType } from '../types/wallet';

export interface WalletDesign {
  label: string;
  walletType: WalletType;
  themeId: ThemeId;
}

export const WALLET_DESIGNS: WalletDesign[] = [
  { label: 'わいわい',   walletType: 'gamaguchi', themeId: 'waiwai' },
  { label: 'ピュア',     walletType: 'gamaguchi', themeId: 'hokkori' },
  { label: 'プリンセス', walletType: 'gamaguchi', themeId: 'princess' },
];

export const DEFAULT_WALLET_DESIGN: WalletDesign = WALLET_DESIGNS[0];
