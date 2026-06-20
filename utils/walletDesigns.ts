import type { ThemeId } from '../types/settings';
import type { WalletType } from '../types/wallet';

export interface WalletDesign {
  label: string;
  walletType: WalletType;
  themeId: ThemeId;
}

export const WALLET_DESIGNS: WalletDesign[] = [
  { label: 'わいわい がま口', walletType: 'gamaguchi', themeId: 'waiwai' },
  { label: 'ほっこり がま口', walletType: 'gamaguchi', themeId: 'hokkori' },
];

export const DEFAULT_WALLET_DESIGN: WalletDesign = WALLET_DESIGNS[0];
