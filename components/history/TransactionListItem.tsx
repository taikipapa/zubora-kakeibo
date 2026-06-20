import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import type { Transaction } from '../../types/transaction';

interface Props {
  transaction: Transaction;
  onDelete?: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${mins}`;
}

export function TransactionListItem({ transaction, onDelete }: Props) {
  const { theme } = useTheme();
  const isIncome = transaction.type === 'income';
  const accentColor = isIncome ? theme.incomeColor : theme.expenseColor;
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.walletName}>{transaction.walletName}</Text>
        <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.typeLabel, { color: accentColor }]}>
          {isIncome ? '入った' : '出た'}
        </Text>
        <Text style={[styles.amount, { color: accentColor }]}>
          {isIncome ? '+' : '-'}
          {transaction.amount.toLocaleString()}円
        </Text>
      </View>
      {onDelete && (
        <Pressable style={styles.deleteButton} onPress={onDelete} hitSlop={8}>
          <Text style={styles.deleteText}>取消</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  left: {
    flex: 1,
    gap: 2,
  },
  walletName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E2700',
  },
  date: {
    fontSize: 11,
    color: '#A07800',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  incomeLabel: {
    color: '#43A047',
  },
  expenseLabel: {
    color: '#E53935',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  incomeAmount: {
    color: '#2E7D32',
  },
  expenseAmount: {
    color: '#C62828',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 11,
    color: '#E53935',
    fontWeight: '700',
  },
});
