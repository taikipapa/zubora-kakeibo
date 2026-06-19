import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createWallet } from '../../domain/wallet/walletService';
import type { WalletType } from '../../types/wallet';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const WALLET_TYPES: { value: WalletType; label: string; emoji: string }[] = [
  { value: 'gamaguchi', label: 'がま口', emoji: '👛' },
  { value: 'kinchaku', label: '巾着', emoji: '👜' },
  { value: 'long', label: '長財布', emoji: '💼' },
  { value: 'folding', label: '二つ折り', emoji: '👝' },
];

export function AddWalletModal({ visible, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('gamaguchi');
  const [saving, setSaving] = useState(false);

  function handleClose() {
    setName('');
    setType('gamaguchi');
    onClose();
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('エラー', '財布名を入力してください');
      return;
    }
    setSaving(true);
    try {
      await createWallet(name.trim(), type);
      setName('');
      setType('gamaguchi');
      onCreated();
    } catch (err) {
      Alert.alert('エラー', err instanceof Error ? err.message : '財布を作成できませんでした');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>財布を追加</Text>

          {/* 名前入力 */}
          <Text style={styles.label}>財布名</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例：おこづかい財布"
            placeholderTextColor="#C8A000"
            maxLength={20}
            autoFocus
          />

          {/* タイプ選択 */}
          <Text style={styles.label}>タイプ</Text>
          <View style={styles.typeRow}>
            {WALLET_TYPES.map((t) => (
              <Pressable
                key={t.value}
                style={[styles.typeButton, type === t.value && styles.typeButtonActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                <Text style={[styles.typeLabel, type === t.value && styles.typeLabelActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* アクションボタン */}
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>{saving ? '作成中...' : '作成'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFDE7',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#3E2700',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8D6E00',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,200,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#3E2700',
    marginBottom: 18,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#FFF9C4',
    borderColor: '#FF8F00',
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8D6E00',
  },
  typeLabelActive: {
    color: '#E65100',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6D4C00',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FF8F00',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#FFCC80',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
