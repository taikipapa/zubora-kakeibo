import { Stack } from 'expo-router';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { resetAllData } from '../domain/wallet/walletService';

function stub(label: string) {
  Alert.alert(label, 'この機能はまだ実装されていません');
}

function handleReset() {
  Alert.alert(
    '全データをリセット',
    'すべての財布と履歴を削除して初期状態に戻します。よろしいですか？',
    [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'リセット',
        style: 'destructive',
        onPress: async () => {
          try {
            await resetAllData();
            Alert.alert('リセットしました', '初期財布「ズボラ財布」が再作成されました');
          } catch (err) {
            Alert.alert('エラー', err instanceof Error ? err.message : 'リセットに失敗しました');
          }
        },
      },
    ],
  );
}

function SettingsRow({
  label,
  description,
  onPress,
  destructive = false,
}: {
  label: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
        {description && <Text style={styles.rowDescription}>{description}</Text>}
      </View>
      <Text style={styles.rowChevron}>›</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen
        options={{
          title: '設定',
          headerStyle: styles.header,
          headerTintColor: '#3E2700',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* テーマ */}
        <Text style={styles.sectionTitle}>表示設定</Text>
        <View style={styles.section}>
          <SettingsRow
            label="テーマ切り替え"
            description="わいわい / ほっこり"
            onPress={() => stub('テーマ切り替え')}
          />
        </View>

        {/* データ管理 */}
        <Text style={styles.sectionTitle}>データ管理</Text>
        <View style={styles.section}>
          <SettingsRow
            label="全データをリセット"
            description="財布・履歴をすべて削除して初期状態に戻す"
            onPress={handleReset}
            destructive
          />
        </View>

        {/* アプリ情報 */}
        <Text style={styles.sectionTitle}>アプリについて</Text>
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>バージョン</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>アプリ名</Text>
            <Text style={styles.infoValue}>ズボラ家計簿</Text>
          </View>
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
  header: {
    backgroundColor: '#FFE033',
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 17,
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8D6E00',
    marginTop: 20,
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3E2700',
  },
  rowLabelDestructive: {
    color: '#E53935',
  },
  rowDescription: {
    fontSize: 12,
    color: '#8D6E00',
  },
  rowChevron: {
    fontSize: 20,
    color: '#C8A000',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3E2700',
  },
  infoValue: {
    fontSize: 14,
    color: '#8D6E00',
  },
});
