import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { TransactionListItem } from '../components/history/TransactionListItem';
import { initDatabase } from '../db/client';
import { getAllTransactions } from '../domain/transaction/transactionRepository';
import { removeTransaction } from '../domain/transaction/transactionService';
import type { Transaction } from '../types/transaction';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTransactions() {
    const data = await getAllTransactions();
    setTransactions(data);
  }

  useEffect(() => {
    initDatabase()
      .then(loadTransactions)
      .catch((err) => console.error('Failed to load transactions', err))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: string) {
    Alert.alert(
      'この履歴を削除しますか？',
      '削除すると残高も元に戻ります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTransaction(id);
              await loadTransactions();
            } catch (err) {
              Alert.alert('エラー', err instanceof Error ? err.message : '削除に失敗しました');
            }
          },
        },
      ],
    );
  }

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
          renderItem={({ item }) => (
            <TransactionListItem transaction={item} onDelete={() => handleDelete(item.id)} />
          )}
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
