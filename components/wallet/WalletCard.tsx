import { Image, StyleSheet, Text, View } from 'react-native';

import { themes } from '../../theme/themes';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeId } from '../../types/settings';
import type { WalletType } from '../../types/wallet';
import { getWalletImage, type WalletMood } from '../../utils/walletImages';

interface Props {
  balance: number;
  type: WalletType;
  mood?: WalletMood;
  themeId?: ThemeId; // override global theme for this wallet
}

const WALLET_EMOJI: Record<WalletType, string> = {
  gamaguchi: '👛',
  kinchaku:  '👜',
  long:      '💼',
  folding:   '👝',
};

export function WalletCard({ balance, type, mood = 'normal', themeId: propThemeId }: Props) {
  const { theme } = useTheme();
  const effectiveTheme = (propThemeId ? (themes[propThemeId] ?? theme) : theme);
  const effectiveThemeId = (propThemeId && themes[propThemeId]) ? propThemeId : theme.id;
  const image = getWalletImage(effectiveThemeId, type, mood);

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={image} style={styles.illustration} resizeMode="contain" />
      ) : (
        <Text style={styles.illustrationEmoji}>{WALLET_EMOJI[type] ?? '👛'}</Text>
      )}
      <View style={[styles.balanceBanner, { backgroundColor: effectiveTheme.balanceBanner }]}>
        <Text style={styles.balanceLabel}>残高</Text>
        <Text style={styles.balanceAmount}>{balance.toLocaleString()}円</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  illustration: {
    width: 220,
    height: 220,
  },
  illustrationEmoji: {
    fontSize: 160,
    lineHeight: 180,
  },
  balanceBanner: {
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#FFEE58',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
