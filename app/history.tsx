import { Stack, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { TransactionListItem } from '../components/history/TransactionListItem';
import { initDatabase } from '../db/client';
import { getTransactionsByWalletId } from '../domain/transaction/transactionRepository';
import { removeTransaction } from '../domain/transaction/transactionService';
import { getAllWallets } from '../domain/wallet/walletRepository';
import { useTheme } from '../theme/ThemeContext';
import type { Transaction } from '../types/transaction';
import type { Wallet } from '../types/wallet';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTransactionsFor(walletList: Wallet[], idx: number) {
    const w = walletList[idx];
    if (!w) { setTransactions([]); return; }
    const data = await getTransactionsByWalletId(w.id);
    setTransactions(data);
  }

  const loadData = useCallback(async () => {
    const updated = await getAllWallets();
    setWallets(updated);
    const w = updated[currentIndexRef.current];
    if (!w) { setTransactions([]); return; }
    const data = await getTransactionsByWalletId(w.id);
    setTransactions(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      initDatabase()
        .then(() => { if (!cancelled) return loadData(); })
        .catch((err) => console.error('Failed to load transactions', err))
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [loadData]),
  );

  function navigate(newIndex: number) {
    setCurrentIndex(newIndex);
    currentIndexRef.current = newIndex;
    loadTransactionsFor(wallets, newIndex).catch(console.error);
  }

  function handleDelete(id: string) {
    Alert.alert(
      'この記録を取り消しますか？',
      'この入出金記録を取り消すと、財布の残高も元に戻ります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '取り消す',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTransaction(id);
              await loadTransactionsFor(wallets, currentIndexRef.current);
            } catch (err) {
              Alert.alert('エラー', err instanceof Error ? err.message : '削除に失敗しました');
            }
          },
        },
      ],
    );
  }

  const wallet = wallets[currentIndex] ?? null;
  const isFirst = currentIndex === 0;
  const isLast = wallets.length === 0 || currentIndex === wallets.length - 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: '履歴', headerStyle: { backgroundColor: theme.background }, headerTintColor: '#3E2700', headerTitleStyle: styles.headerTitle }} />

      {/* Wallet selector */}
      {wallets.length > 0 && (
        <View style={styles.walletNav}>
          <Pressable
            style={[styles.navButton, { backgroundColor: theme.primary }, isFirst && styles.navButtonDisabled]}
            onPress={() => navigate(currentIndex - 1)}
            disabled={isFirst}
          >
            <Text style={[styles.navButtonText, isFirst && styles.navButtonTextDisabled]}>◀</Text>
          </Pressable>
          <View style={styles.walletInfo}>
            <Text style={[styles.walletName, { color: theme.textDark }]} numberOfLines={1}>{wallet?.name ?? ''}</Text>
            <Text style={[styles.pageIndicator, { color: theme.textMid }]}>{currentIndex + 1} / {wallets.length}</Text>
          </View>
          <Pressable
            style={[styles.navButton, { backgroundColor: theme.primary }, isLast && styles.navButtonDisabled]}
            onPress={() => navigate(currentIndex + 1)}
            disabled={isLast}
          >
            <Text style={[styles.navButtonText, isLast && styles.navButtonTextDisabled]}>▶</Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionListItem transaction={item} onDelete={() => handleDelete(item.id)} />
          )}
          contentContainerStyle={transactions.length === 0 ? styles.emptyContainer : [styles.listContent, { backgroundColor: theme.card }]}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: theme.textMid }]}>まだ履歴がありません</Text>
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
  walletNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8F00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255,143,0,0.25)',
    shadowOpacity: 0,
    elevation: 0,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  navButtonTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  walletInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  walletName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3E2700',
  },
  pageIndicator: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8D6E00',
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
