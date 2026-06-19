import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TransactionType } from '../../types/transaction';

interface Props {
  value: TransactionType | null;
  onChange: (type: TransactionType) => void;
}

export function TransactionTypeToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, value === 'income' ? styles.incomeActive : styles.incomeInactive]}
        onPress={() => onChange('income')}
      >
        <Text style={[styles.text, value === 'income' ? styles.incomeActiveText : styles.incomeInactiveText]}>
          ↑ 入れる
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, value === 'expense' ? styles.expenseActive : styles.expenseInactive]}
        onPress={() => onChange('expense')}
      >
        <Text style={[styles.text, value === 'expense' ? styles.expenseActiveText : styles.expenseInactiveText]}>
          ↓ 出す
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  /* 入れる */
  incomeActive: {
    backgroundColor: '#43A047',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  incomeInactive: {
    backgroundColor: 'rgba(67,160,71,0.08)',
    borderWidth: 1.5,
    borderColor: '#43A047',
  },
  /* 出す */
  expenseActive: {
    backgroundColor: '#E53935',
    shadowColor: '#B71C1C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  expenseInactive: {
    backgroundColor: 'rgba(229,57,53,0.08)',
    borderWidth: 1.5,
    borderColor: '#E53935',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  incomeActiveText: {
    color: '#FFFFFF',
  },
  incomeInactiveText: {
    color: '#388E3C',
  },
  expenseActiveText: {
    color: '#FFFFFF',
  },
  expenseInactiveText: {
    color: '#C62828',
  },
});
