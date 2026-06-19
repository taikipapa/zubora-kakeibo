import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TransactionType } from '../../types/transaction';

interface Props {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

export function TransactionTypeToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, value === 'income' ? styles.incomeActive : styles.inactive]}
        onPress={() => onChange('income')}
      >
        <Text style={[styles.text, value === 'income' ? styles.incomeText : styles.inactiveText]}>
          ↑ 入れる
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, value === 'expense' ? styles.expenseActive : styles.inactive]}
        onPress={() => onChange('expense')}
      >
        <Text style={[styles.text, value === 'expense' ? styles.expenseText : styles.inactiveText]}>
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
  incomeActive: {
    backgroundColor: '#43A047',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  expenseActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E53935',
    shadowColor: '#B71C1C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inactive: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  incomeText: {
    color: '#FFFFFF',
  },
  expenseText: {
    color: '#E53935',
  },
  inactiveText: {
    color: '#8D6E00',
  },
});
