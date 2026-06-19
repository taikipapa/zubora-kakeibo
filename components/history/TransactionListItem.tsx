import { StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '../../types/transaction';

interface Props {
  transaction: Transaction;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${mins}`;
}

export function TransactionListItem({ transaction }: Props) {
  const isIncome = transaction.type === 'income';
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.walletName}>{transaction.walletName}</Text>
        <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.typeLabel, isIncome ? styles.incomeLabel : styles.expenseLabel]}>
          {isIncome ? '入った' : '出た'}
        </Text>
        <Text style={[styles.amount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
          {isIncome ? '+' : '-'}
          {transaction.amount.toLocaleString()}円
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
