import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NumPad } from '../components/transaction/NumPad';
import { TransactionTypeToggle } from '../components/transaction/TransactionTypeToggle';
import { HomeBannerAd } from '../components/common/HomeBannerAd';
import { WalletHistorySheet } from '../components/history/WalletHistorySheet';
import { MoneyAnimation, type MoneyAnimationHandle } from '../components/wallet/MoneyAnimation';
import { AddWalletModal } from '../components/wallet/AddWalletModal';
import { WalletCard } from '../components/wallet/WalletCard';
import { WalletTabBar } from '../components/wallet/WalletTabBar';
import { initDatabase } from '../db/client';
import { themes } from '../theme/themes';
import { useTheme } from '../theme/ThemeContext';
import { addTransaction } from '../domain/transaction/transactionService';
import { getAllWallets } from '../domain/wallet/walletRepository';
import { deleteWallet as deleteWalletService, reorderWallets } from '../domain/wallet/walletService';
import { maybeShowInterstitial } from '../services/ads/InterstitialAdService';
import { showRewardedAd } from '../services/ads/RewardAdService';
import type { WalletMood } from '../utils/walletImages';
import type { TransactionType } from '../types/transaction';
import type { Wallet } from '../types/wallet';

const MAX_WALLETS = 10;
const MAX_AMOUNT = 9999999;
const MOOD_RESET_DELAY_MS = 2000;

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [amount, setAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [displayMood, setDisplayMood] = useState<WalletMood>('normal');
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interstitialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moneyAnimRef = useRef<MoneyAnimationHandle>(null);

  useEffect(() => {
    return () => {
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
      if (interstitialTimerRef.current) clearTimeout(interstitialTimerRef.current);
    };
  }, []);

  const loadData = useCallback(async () => {
    const updated = await getAllWallets();
    setWallets(updated);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      initDatabase()
        .then(async () => {
          if (cancelled) return;
          const updated = await getAllWallets();
          if (cancelled) return;
          setWallets(updated);
          // After a data reset wallets shrinks, but currentIndex may still point past the end.
          // Clamp to 0 so wallet is never null when wallets is non-empty.
          if (updated.length > 0 && currentIndexRef.current >= updated.length) {
            setCurrentIndex(0);
            currentIndexRef.current = 0;
          }
        })
        .catch((err) => console.error('Failed to load data', err))
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, []),
  );

  function navigate(newIndex: number) {
    setCurrentIndex(newIndex);
    currentIndexRef.current = newIndex;
  }

  function handleNumPadKey(key: string) {
    setErrorMessage(null);
    if (key === '⌫') {
      setAmount(prev => Math.floor(prev / 10));
      return;
    }
    if (key === '00') {
      setAmount(prev => {
        if (prev === 0) return 0;
        const next = prev * 100;
        return next > MAX_AMOUNT ? prev : next;
      });
      return;
    }
    const digit = parseInt(key, 10);
    setAmount(prev => {
      const next = prev * 10 + digit;
      return next > MAX_AMOUNT ? prev : next;
    });
  }

  const wallet = wallets[currentIndex] ?? null;
  // Use wallet's themeId for home screen UI; always fall back to waiwai if missing/invalid
  const walletThemeId = (wallet?.themeId && wallet.themeId in themes) ? wallet.themeId : 'waiwai';
  const walletTheme = themes[walletThemeId] ?? themes.waiwai;
  const hasValidAmount = amount > 0;

  async function handleTransactionTypePress(type: TransactionType) {
    setTransactionType(type);
    if (!hasValidAmount || !wallet || saving) return;

    // Instantly show mood and fire animation BEFORE DB
    const savedMood: WalletMood = type === 'income' ? 'happy' : 'sad';
    setDisplayMood(savedMood);
    moneyAnimRef.current?.play(type, amount);
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);

    setSaving(true);
    setErrorMessage(null);
    try {
      await addTransaction(wallet.id, type, amount);
      const updated = await getAllWallets();
      setWallets(updated);
      setAmount(0);
      setTransactionType(null);
      moodTimerRef.current = setTimeout(() => setDisplayMood('normal'), MOOD_RESET_DELAY_MS);
      // Delay interstitial so balance/animation are visible on screen before the ad appears
      interstitialTimerRef.current = setTimeout(() => maybeShowInterstitial(), 700);
    } catch (err) {
      setDisplayMood('normal');
      setErrorMessage(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function handleWalletCreated(newWalletId: string) {
    setShowAddModal(false);
    const updated = await getAllWallets();
    setWallets(updated);
    // Locate the newly created wallet by ID regardless of sort order
    const newIdx = updated.findIndex(w => w.id === newWalletId);
    const idx = newIdx >= 0 ? newIdx : updated.length - 1;
    setCurrentIndex(idx);
    currentIndexRef.current = idx;
  }

  async function handleDeleteWalletFromTab(w: Wallet) {
    try {
      const selectedId = wallets[currentIndex]?.id;
      await deleteWalletService(w.id);
      const updated = await getAllWallets();
      setWallets(updated);
      // Keep selected wallet if it still exists; otherwise go to index 0
      let newIdx = updated.findIndex(x => x.id === selectedId);
      if (newIdx < 0) newIdx = 0;
      setCurrentIndex(newIdx);
      currentIndexRef.current = newIdx;
    } catch (err) {
      Alert.alert('エラー', err instanceof Error ? err.message : '削除に失敗しました');
    }
  }

  async function handleReorderWallets(newOrder: Wallet[]) {
    try {
      const selectedId = wallets[currentIndex]?.id;
      await reorderWallets(newOrder);
      const updated = await getAllWallets();
      setWallets(updated);
      let newIdx = updated.findIndex(x => x.id === selectedId);
      if (newIdx < 0) newIdx = 0;
      setCurrentIndex(newIdx);
      currentIndexRef.current = newIdx;
    } catch (err) {
      console.error('Failed to reorder wallets', err);
    }
  }

  function handleSelectWalletById(walletId: string) {
    const idx = wallets.findIndex(w => w.id === walletId);
    if (idx >= 0) navigate(idx);
  }

  function handleAddWalletPress() {
    if (wallets.length >= MAX_WALLETS) {
      Alert.alert('上限に達しています', `財布は${MAX_WALLETS}個までです`);
      return;
    }
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
            } else {
              Alert.alert('広告の視聴が完了しませんでした', '財布を追加するには広告を最後まで視聴してください。');
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

  const isAtLimit = wallets.length >= MAX_WALLETS;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: walletTheme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <AddWalletModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleWalletCreated}
      />
      <WalletHistorySheet
        visible={showHistorySheet}
        wallet={wallet}
        onClose={() => setShowHistorySheet(false)}
        onTransactionDeleted={loadData}
      />

      <View style={styles.screen}>
        {/* Wallet tab bar: drag to reorder, long press to delete */}
        <WalletTabBar
          wallets={wallets}
          selectedWalletId={wallet.id}
          isAtLimit={isAtLimit}
          currentTheme={walletTheme}
          onSelect={handleSelectWalletById}
          onAdd={handleAddWalletPress}
          onDelete={handleDeleteWalletFromTab}
          onReorder={handleReorderWallets}
          onSettings={() => router.push('/settings')}
        />

        {/* Wallet card: image + balance — tap to open history sheet */}
        <Pressable
          style={styles.walletSection}
          onPress={() => setShowHistorySheet(true)}
          disabled={saving}
        >
          <WalletCard
            balance={wallet.balance}
            type={wallet.type}
            mood={displayMood}
            themeId={wallet.themeId}
          />
          <MoneyAnimation ref={moneyAnimRef} themeId={walletThemeId} />
        </Pressable>

        {/* 入れる / 出す (dimmed when amount is 0) */}
        <View style={[styles.toggleWrapper, !hasValidAmount && styles.toggleDisabled]}
              pointerEvents={hasValidAmount ? 'auto' : 'box-none'}>
          <TransactionTypeToggle value={transactionType} onChange={handleTransactionTypePress} />
        </View>

        {/* Amount display */}
        <View style={styles.amountDisplay}>
          <Text style={[
            styles.amountText,
            walletThemeId === 'host' && {
              color: '#FFD700',
              textShadowColor: 'rgba(0,0,0,0.9)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            },
          ]}>
            {amount > 0 ? amount.toLocaleString() : '0'}
          </Text>
          <Text style={[
            styles.amountUnit,
            walletThemeId === 'host' && { color: '#FFD700' },
          ]}>円</Text>
        </View>

        {/* Error message */}
        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {/* Custom numpad */}
        <NumPad onPress={handleNumPadKey} />

        <HomeBannerAd />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFE033',
  },
  screen: {
    flex: 1,
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

  /* Wallet section */
  walletSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Toggle */
  toggleWrapper: {
    marginTop: 4,
  },
  toggleDisabled: {
    opacity: 0.35,
  },

  /* Amount display */
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  amountText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#3E2700',
    letterSpacing: 1,
  },
  amountUnit: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5D3A00',
    marginLeft: 6,
  },
  errorText: {
    marginHorizontal: 24,
    marginBottom: 4,
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
    textAlign: 'right',
  },
});
