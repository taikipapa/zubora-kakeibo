import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { WalletType } from '../../types/wallet';
import { getWalletImage, type WalletMood } from '../../utils/walletImages';

interface Props {
  name: string;
  balance: number;
  type: WalletType;
  mood?: WalletMood;
}

const WALLET_EMOJI: Record<WalletType, string> = {
  gamaguchi: '👛',
  kinchaku:  '👜',
  long:      '💼',
  folding:   '👝',
};

export function WalletCard({ name, balance, type, mood = 'normal' }: Props) {
  const { theme } = useTheme();
  const image = getWalletImage(theme.id, type, mood);

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={image} style={styles.illustration} resizeMode="contain" />
      ) : (
        <Text style={styles.illustrationEmoji}>{WALLET_EMOJI[type] ?? '👛'}</Text>
      )}
      <Text style={styles.name}>{name}</Text>
      <View style={[styles.balanceBanner, { backgroundColor: theme.balanceBanner }]}>
        <Text style={styles.balanceLabel}>残高</Text>
        <Text style={styles.balanceAmount}>{balance.toLocaleString()}円</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  illustration: {
    width: 120,
    height: 120,
  },
  illustrationEmoji: {
    fontSize: 96,
    lineHeight: 112,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5D3A00',
    marginTop: 8,
    letterSpacing: 1,
  },
  balanceBanner: {
    marginTop: 12,
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    shadowColor: '#B71C1C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
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
