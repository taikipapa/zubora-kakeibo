import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AmountInput } from '../components/transaction/AmountInput';
import { TransactionTypeToggle } from '../components/transaction/TransactionTypeToggle';
import { TransactionListItem } from '../components/history/TransactionListItem';
import { WalletCard } from '../components/wallet/WalletCard';
import { initDatabase } from '../db/client';
import { getAllTransactions } from '../domain/transaction/transactionRepository';
import { addTransaction } from '../domain/transaction/transactionService';
import { getAllWallets } from '../domain/wallet/walletRepository';
import type { Transaction, TransactionType } from '../types/transaction';
import type { Wallet } from '../types/wallet';

export default function HomeScreen() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadData() {
    const [updatedWallets, allTransactions] = await Promise.all([
      getAllWallets(),
      getAllTransactions(),
    ]);
    setWallets(updatedWallets);
    setRecentTransactions(allTransactions.slice(0, 5));
  }

  useEffect(() => {
    initDatabase()
      .then(loadData)
      .catch((err) => console.error('Failed to load data', err))
      .finally(() => setLoading(false));
  }, []);

  const wallet = wallets[0] ?? null;

  async function handleSave() {
    if (!wallet) return;
    const parsed = parseInt(amount, 10);
    if (!amount.trim() || isNaN(parsed) || parsed <= 0) {
      setErrorMessage('金額を正しく入力してください');
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      await addTransaction(wallet.id, transactionType, parsed);
      await loadData();
      setAmount('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF8F00" />
          <Text style={styles.loadingText}>財布を準備中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>財布を準備中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header row: page indicator + add wallet button */}
        <View style={styles.header}>
          <View style={styles.pageBadge}>
            <Text style={styles.pageText}>
              1 / {wallets.length}
            </Text>
          </View>
          <Pressable style={styles.addWalletButton}>
            <Text style={styles.addWalletText}>＋ 財布を追加</Text>
          </Pressable>
        </View>

        {/* Wallet card: illustration + name + balance banner */}
        <WalletCard name={wallet.name} balance={wallet.balance} type={wallet.type} />

        {/* 入れる / 出す toggle */}
        <TransactionTypeToggle value={transactionType} onChange={setTransactionType} />

        {/* Amount input */}
        <AmountInput value={amount} onChange={(v) => { setAmount(v); setErrorMessage(null); }} />

        {/* Validation error */}
        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {/* Save button */}
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? '保存中...' : '保存'}</Text>
        </Pressable>

        {/* Recent history area */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>最近の履歴</Text>
          {recentTransactions.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Text style={styles.historyEmptyText}>まだ履歴がありません</Text>
            </View>
          ) : (
            recentTransactions.map((t) => (
              <TransactionListItem key={t.id} transaction={t} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFE033',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8D6E00',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  pageBadge: {
    backgroundColor: '#FF8F00',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  pageText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  addWalletButton: {
    backgroundColor: '#FF8F00',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  addWalletText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    marginHorizontal: 24,
    marginTop: 8,
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
  },
  saveButton: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: '#43A047',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  historySection: {
    marginTop: 28,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 16,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5D3A00',
    marginBottom: 12,
  },
  historyEmpty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  historyEmptyText: {
    fontSize: 14,
    color: '#A07800',
  },
});
