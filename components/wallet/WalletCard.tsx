import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { WalletType } from '../../types/wallet';

interface Props {
  name: string;
  balance: number;
  type: WalletType;
}

export function WalletCard({ name, balance }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.illustration}>👛</Text>
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
