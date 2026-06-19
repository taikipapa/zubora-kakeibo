import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AmountInput } from '../components/transaction/AmountInput';
import { TransactionListItem } from '../components/history/TransactionListItem';
import { TransactionTypeToggle } from '../components/transaction/TransactionTypeToggle';
import { AddWalletModal } from '../components/wallet/AddWalletModal';
import { WalletCard } from '../components/wallet/WalletCard';
import { initDatabase } from '../db/client';
import { useTheme } from '../theme/ThemeContext';
import { getRecentTransactionsByWalletId } from '../domain/transaction/transactionRepository';
import { addTransaction } from '../domain/transaction/transactionService';
import { getAllWallets } from '../domain/wallet/walletRepository';
import { deleteWallet } from '../domain/wallet/walletService';
import type { Transaction, TransactionType } from '../types/transaction';
import type { Wallet } from '../types/wallet';

// Stub for rewarded ad — replace with real AdMob implementation when ready.
// Returns true if the user completed watching the ad, false otherwise.
async function showRewardedAd(): Promise<boolean> {
  // TODO: load and show AdMob rewarded ad here
  return true;
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch recent transactions for a specific wallet
  async function loadTransactionsFor(walletList: Wallet[], idx: number) {
    const w = walletList[idx];
    if (!w) { setRecentTransactions([]); return; }
    const txns = await getRecentTransactionsByWalletId(w.id, 5);
    setRecentTransactions(txns);
  }

  // Reload all wallets + transactions for current index (used by useFocusEffect)
  const loadData = useCallback(async () => {
    const updated = await getAllWallets();
    setWallets(updated);
    const w = updated[currentIndexRef.current];
    if (!w) { setRecentTransactions([]); return; }
    const txns = await getRecentTransactionsByWalletId(w.id, 5);
    setRecentTransactions(txns);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      initDatabase()
        .then(() => { if (!cancelled) return loadData(); })
        .catch((err) => console.error('Failed to load data', err))
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [loadData]),
  );

  // Switch to another wallet by index
  function navigate(newIndex: number) {
    setCurrentIndex(newIndex);
    currentIndexRef.current = newIndex;
    loadTransactionsFor(wallets, newIndex).catch(console.error);
  }

  const wallet = wallets[currentIndex] ?? null;

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
      const updated = await getAllWallets();
      setWallets(updated);
      await loadTransactionsFor(updated, currentIndexRef.current);
      setAmount('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function handleWalletCreated() {
    setShowAddModal(false);
    const updated = await getAllWallets();
    const newIndex = updated.length - 1;
    setWallets(updated);
    setCurrentIndex(newIndex);
    currentIndexRef.current = newIndex;
    await loadTransactionsFor(updated, newIndex);
  }

  function handleAddWalletPress() {
    Alert.alert(
      '財布を追加',
      '財布を追加するには広告を見る必要があります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '広告を見る',
          onPress: async () => {
            const completed = await showRewardedAd();
            if (completed) {
              setShowAddModal(true);
            }
          },
        },
      ],
    );
  }

  function handleDeleteWallet() {
    if (!wallet) return;
    if (wallets.length <= 1) {
      Alert.alert('削除できません', '最後の財布は削除できません');
      return;
    }
    Alert.alert(
      `「${wallet.name}」を削除しますか？`,
      'この財布の入出金履歴もすべて削除されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWallet(wallet.id);
              const updated = await getAllWallets();
              const newIndex = Math.max(0, currentIndex - 1);
              setWallets(updated);
              setCurrentIndex(newIndex);
              currentIndexRef.current = newIndex;
              await loadTransactionsFor(updated, newIndex);
            } catch (err) {
              Alert.alert('エラー', err instanceof Error ? err.message : '削除に失敗しました');
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>財布を準備中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>財布を準備中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === wallets.length - 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <AddWalletModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleWalletCreated}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header: nav buttons + page indicator + add wallet */}
        <View style={styles.header}>
          <View style={styles.navGroup}>
            <Pressable
              style={[styles.navButton, { backgroundColor: theme.primary }, isFirst && styles.navButtonDisabled]}
              onPress={() => navigate(currentIndex - 1)}
              disabled={isFirst}
            >
              <Text style={[styles.navButtonText, isFirst && styles.navButtonTextDisabled]}>◀</Text>
            </Pressable>
            <View style={[styles.pageBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.pageText}>{currentIndex + 1} / {wallets.length}</Text>
            </View>
            <Pressable
              style={[styles.navButton, { backgroundColor: theme.primary }, isLast && styles.navButtonDisabled]}
              onPress={() => navigate(currentIndex + 1)}
              disabled={isLast}
            >
              <Text style={[styles.navButtonText, isLast && styles.navButtonTextDisabled]}>▶</Text>
            </Pressable>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={[styles.addWalletButton, { backgroundColor: theme.primary }]} onPress={handleAddWalletPress}>
              <Text style={styles.addWalletText}>＋ 財布を追加</Text>
            </Pressable>
            <Pressable style={styles.settingsButton} onPress={() => router.push('/settings')}>
              <Text style={styles.settingsButtonText}>⚙</Text>
            </Pressable>
          </View>
        </View>

        {/* Wallet card */}
        <WalletCard name={wallet.name} balance={wallet.balance} type={wallet.type} />

        {/* Delete wallet button */}
        <Pressable style={styles.deleteWalletButton} onPress={handleDeleteWallet}>
          <Text style={styles.deleteWalletText}>この財布を削除</Text>
        </Pressable>

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
          style={[styles.saveButton, { backgroundColor: theme.saveButton }, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? '保存中...' : '保存'}</Text>
        </Pressable>

        {/* Recent history */}
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
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
    color: '#5D3A00',
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
  deleteWalletButton: {
    alignSelf: 'center',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  deleteWalletText: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '600',
    textDecorationLine: 'underline',
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
