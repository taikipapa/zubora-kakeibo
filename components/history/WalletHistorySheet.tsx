import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TransactionListItem } from './TransactionListItem';
import { getTransactionsByWalletId } from '../../domain/transaction/transactionRepository';
import { removeTransaction } from '../../domain/transaction/transactionService';
import { useTheme } from '../../theme/ThemeContext';
import type { Transaction } from '../../types/transaction';
import type { Wallet } from '../../types/wallet';

interface Props {
  visible: boolean;
  wallet: Wallet | null;
  onClose: () => void;
  onTransactionDeleted?: () => Promise<void> | void;
}

export function WalletHistorySheet({ visible, wallet, onClose, onTransactionDeleted }: Props) {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !wallet) {
      setTransactions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getTransactionsByWalletId(wallet.id)
      .then((data) => { if (!cancelled) setTransactions(data); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [visible, wallet?.id]);

  function handleDelete(transactionId: string) {
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
              await removeTransaction(transactionId);
              if (wallet) {
                const updated = await getTransactionsByWalletId(wallet.id);
                setTransactions(updated);
              }
              await onTransactionDeleted?.();
            } catch (err) {
              Alert.alert('エラー', err instanceof Error ? err.message : '削除に失敗しました');
            }
          },
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={[styles.sheet, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.handleBar} />
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {wallet?.name ?? ''} の履歴
            </Text>
            <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TransactionListItem
                transaction={item}
                onDelete={() => handleDelete(item.id)}
              />
            )}
            contentContainerStyle={
              transactions.length === 0
                ? styles.emptyContainer
                : [styles.listContent, { backgroundColor: theme.card }]
            }
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={[styles.emptyText, { color: theme.textMid }]}>
                  まだ履歴がありません
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#3E2700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 13,
    color: '#5D3A00',
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
  },
  listContent: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
