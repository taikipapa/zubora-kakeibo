import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { TransactionListItem } from '../components/history/TransactionListItem';
import { initDatabase } from '../db/client';
import { getAllTransactions } from '../domain/transaction/transactionRepository';
import type { Transaction } from '../types/transaction';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDatabase()
      .then(() => getAllTransactions())
      .then(setTransactions)
      .catch((err) => console.error('Failed to load transactions', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: '履歴', headerStyle: styles.header, headerTintColor: '#3E2700', headerTitleStyle: styles.headerTitle }} />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF8F00" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionListItem transaction={item} />}
          contentContainerStyle={transactions.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>まだ履歴がありません</Text>
            </View>
          }
          ItemSeparatorComponent={() => null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFE033',
  },
  header: {
    backgroundColor: '#FFE033',
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 17,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
  listContent: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#A07800',
    fontWeight: '600',
  },
});
