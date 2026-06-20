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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      normal: require('../assets/images/wallets/waiwai/gamaguchi-normal.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      happy:  require('../assets/images/wallets/waiwai/gamaguchi-happy.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sad:    require('../assets/images/wallets/waiwai/gamaguchi-sad.png'),
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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      normal: require('../assets/images/wallets/hokkori/gamaguchi-normal.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      happy:  require('../assets/images/wallets/hokkori/gamaguchi-happy.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sad:    require('../assets/images/wallets/hokkori/gamaguchi-sad.png'),
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
  princess: {
    gamaguchi: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      normal: require('../assets/images/wallets/princess/gamaguchi-normal.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      happy:  require('../assets/images/wallets/princess/gamaguchi-happy.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sad:    require('../assets/images/wallets/princess/gamaguchi-sad.png'),
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
  prince: {
    gamaguchi: {
      normal: null,
      happy:  null,
      sad:    null,
    },
    kinchaku: {
      normal: null,
      happy:  null,
      sad:    null,
    },
    long: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      normal: require('../assets/images/wallets/prince/long-normal.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      happy:  require('../assets/images/wallets/prince/long-happy.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sad:    require('../assets/images/wallets/prince/long-sad.png'),
    },
    folding: {
      normal: null,
      happy:  null,
      sad:    null,
    },
  },
  host: {
    gamaguchi: {
      normal: null,
      happy:  null,
      sad:    null,
    },
    kinchaku: {
      normal: null,
      happy:  null,
      sad:    null,
    },
    long: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      normal: require('../assets/images/wallets/host/long-normal.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      happy:  require('../assets/images/wallets/host/long-happy.png'),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sad:    require('../assets/images/wallets/host/long-sad.png'),
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

/**
 * Determine the themeId that belongs to a given walletType.
 * walletType and its visual theme/image set are always paired.
 * When new walletTypes are added, extend this switch.
 */
export function getThemeIdForWalletType(walletType: WalletType): ThemeId {
  switch (walletType) {
    case 'gamaguchi':
      return 'waiwai';
    case 'kinchaku':
      return 'waiwai';
    case 'long':
      return 'hokkori';
    case 'folding':
      return 'hokkori';
    default:
      return 'waiwai';
  }
}

/** Derive WalletMood from transaction type selection. */
export function moodFromTransactionType(
  transactionType: 'income' | 'expense' | null,
): WalletMood {
  if (transactionType === 'income') return 'happy';
  if (transactionType === 'expense') return 'sad';
  return 'normal';
}
