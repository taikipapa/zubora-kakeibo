import type { ImageSourcePropType } from 'react-native';

import type { ThemeId } from '../types/settings';
import type { WalletType } from '../types/wallet';

export type WalletMood = 'normal' | 'happy' | 'sad';

type MoodMap = Record<WalletMood, ImageSourcePropType | null>;
type WalletMap = Partial<Record<WalletType, MoodMap>>;
type ThemeMap = Record<ThemeId, WalletMap>;

/**
 * Wallet illustration image map.
 * Each entry is null until the actual image file is placed in assets/images/wallets/.
 *
 * File placement rule: assets/images/wallets/{themeId}/{walletType}-{mood}.png
 *
 * To activate an image, replace null with:
 *   require('../assets/images/wallets/waiwai/gamaguchi-normal.png')
 */
const WALLET_IMAGES: ThemeMap = {
  waiwai: {
    gamaguchi: {
      normal: null, // require('../assets/images/wallets/waiwai/gamaguchi-normal.png')
      happy:  null, // require('../assets/images/wallets/waiwai/gamaguchi-happy.png')
      sad:    null, // require('../assets/images/wallets/waiwai/gamaguchi-sad.png')
    },
    kinchaku: {
      normal: null,
      happy:  null,
      sad:    null,
    },
    long: {
      normal: null,
      happy:  null,
      sad:    null,
    },
    folding: {
      normal: null,
      happy:  null,
      sad:    null,
    },
  },
  hokkori: {
    gamaguchi: {
      normal: null, // require('../assets/images/wallets/hokkori/gamaguchi-normal.png')
      happy:  null, // require('../assets/images/wallets/hokkori/gamaguchi-happy.png')
      sad:    null, // require('../assets/images/wallets/hokkori/gamaguchi-sad.png')
    },
    kinchaku: {
      normal: null,
      happy:  null,
      sad:    null,
    },
    long: {
      normal: null,
      happy:  null,
      sad:    null,
    },
    folding: {
      normal: null,
      happy:  null,
      sad:    null,
    },
  },
};

/** Returns the image source for the given theme/type/mood, or null if not yet available. */
export function getWalletImage(
  themeId: ThemeId,
  type: WalletType,
  mood: WalletMood,
): ImageSourcePropType | null {
  return WALLET_IMAGES[themeId]?.[type]?.[mood] ?? null;
}

/** Derive WalletMood from transaction type selection. */
export function moodFromTransactionType(
  transactionType: 'income' | 'expense' | null,
): WalletMood {
  if (transactionType === 'income') return 'happy';
  if (transactionType === 'expense') return 'sad';
  return 'normal';
}
