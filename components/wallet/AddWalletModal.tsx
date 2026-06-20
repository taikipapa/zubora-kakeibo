import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createWallet } from '../../domain/wallet/walletService';
import { WALLET_DESIGNS, DEFAULT_WALLET_DESIGN, type WalletDesign } from '../../utils/walletDesigns';
import { getWalletImage } from '../../utils/walletImages';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: (walletId: string) => void;
}

export function AddWalletModal({ visible, onCreated }: Props) {
  const [name, setName] = useState('');
  const [design, setDesign] = useState<WalletDesign>(DEFAULT_WALLET_DESIGN);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('エラー', '財布名を入力してください');
      return;
    }
    setSaving(true);
    try {
      const newWallet = await createWallet(name.trim(), design.walletType, design.themeId);
      setName('');
      setDesign(DEFAULT_WALLET_DESIGN);
      onCreated(newWallet.id);
    } catch (err) {
      Alert.alert('エラー', err instanceof Error ? err.message : '財布を作成できませんでした');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      {/* No onPress on overlay — tapping outside does nothing */}
      <View style={styles.overlay}>
        <View style={styles.card}>
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

          {/* 財布デザイン選択 */}
          <Text style={styles.label}>財布を選ぶ</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
            contentContainerStyle={styles.typeRow}
          >
            {WALLET_DESIGNS.map((d) => {
              const image = getWalletImage(d.themeId, d.walletType, 'normal');
              const isSelected = d.themeId === design.themeId && d.walletType === design.walletType;
              return (
                <Pressable
                  key={`${d.themeId}-${d.walletType}`}
                  style={[styles.typeButton, isSelected && styles.typeButtonActive]}
                  onPress={() => setDesign(d)}
                >
                  {image ? (
                    <Image source={image} style={styles.typeImage} resizeMode="contain" />
                  ) : (
                    <Text style={styles.typeEmoji}>👛</Text>
                  )}
                  <Text style={[styles.typeLabel, isSelected && styles.typeLabelActive]}>
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* 作成ボタンのみ（キャンセルなし） */}
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>{saving ? '作成中...' : '作成'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFDE7',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3E2700',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
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
    marginBottom: 14,
  },
  typeScroll: {
    marginBottom: 20,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 12,
  },
  typeButton: {
    width: 86,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#FFF9C4',
    borderColor: '#FF8F00',
  },
  typeImage: {
    width: 48,
    height: 48,
    marginBottom: 2,
  },
  typeEmoji: {
    fontSize: 32,
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
  saveButton: {
    paddingVertical: 14,
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
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
