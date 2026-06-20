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
  const typeLabel = isIncome ? '入れた' : '出した';
  const amountLabel = `${isIncome ? '+' : '-'}¥${transaction.amount.toLocaleString()}`;

  return (
    <View style={styles.row}>
      {/* Left: type label + date */}
      <View style={styles.left}>
        <Text style={[styles.typeLabel, { color: accentColor }]}>{typeLabel}</Text>
        <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
      </View>

      {/* Right: amount */}
      <Text style={[styles.amount, { color: accentColor }]}>{amountLabel}</Text>

      {/* Cancel button */}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  left: {
    flex: 1,
    gap: 3,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    color: 'rgba(93,58,0,0.45)',
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
    marginRight: 12,
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
