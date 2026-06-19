import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, PanResponder, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';

import { themes } from '../../theme/themes';
import type { Theme } from '../../theme/themes';
import type { Wallet } from '../../types/wallet';

/** Long press must hold this long (ms) before vibrating / entering grab state */
const LONG_PRESS_MS = 450;
/** Movement (px) DURING drag phase that triggers actual reorder swap */
const DRAG_THRESHOLD_PX = 8;
/** Movement (px) BEFORE long press fires that cancels the long press entirely */
const CANCEL_BEFORE_GRAB_PX = 20;

type GesturePhase = 'idle' | 'pressing' | 'grabbed' | 'dragging' | 'cancelled';

interface Props {
  wallets: Wallet[];
  selectedWalletId: string | null;
  isAtLimit: boolean;
  currentTheme: Theme;
  onSelect: (walletId: string) => void;
  onAdd: () => void;
  onDelete: (wallet: Wallet) => void;
  onReorder: (newOrder: Wallet[]) => void;
  onSettings: () => void;
}

export function WalletTabBar({
  wallets,
  selectedWalletId,
  isAtLimit,
  currentTheme,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
  onSettings,
}: Props) {
  const [localOrder, setLocalOrder] = useState<Wallet[]>(wallets);
  const [activeTabIdx, setActiveTabIdx] = useState(-1); // grabbed or dragging

  // Sync localOrder when wallets prop changes, but only when not interacting
  const activeTabIdxRef = useRef(-1);
  activeTabIdxRef.current = activeTabIdx;
  useEffect(() => {
    if (activeTabIdxRef.current === -1) setLocalOrder(wallets);
  }, [wallets]);

  // Cleanup timer on unmount
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); };
  }, []);

  // Refs used inside useMemo PanResponder (stable, avoids stale closures)
  const localOrderRef = useRef<Wallet[]>(localOrder);
  localOrderRef.current = localOrder;

  const callbacksRef = useRef({ onSelect, onDelete, onReorder });
  callbacksRef.current = { onSelect, onDelete, onReorder };

  const phaseRef = useRef<GesturePhase>('idle');
  const activeIdxRef = useRef(-1);
  const tabLayoutsRef = useRef<{ x: number; width: number }[]>([]);

  // Stable helper: find nearest tab center to touch x position
  const findTargetIdxRef = useRef((x: number): number => {
    const layouts = tabLayoutsRef.current;
    if (layouts.length === 0) return 0;
    let closest = 0, minDist = Infinity;
    for (let i = 0; i < layouts.length; i++) {
      const l = layouts[i];
      if (!l) continue;
      const center = l.x + l.width / 2;
      const dist = Math.abs(x - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    return closest;
  });

  // Stable helper: show delete alert (reads current refs at call time)
  const showDeleteDialogRef = useRef((idx: number) => {
    const wallet = localOrderRef.current[idx];
    if (!wallet) return;
    if (localOrderRef.current.length <= 1) {
      Alert.alert('削除できません', '最後の財布は削除できません');
      return;
    }
    Alert.alert(
      '財布を削除しますか？',
      `「${wallet.name}」を削除します。この財布の履歴も削除されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除', style: 'destructive', onPress: () => callbacksRef.current.onDelete(wallet) },
      ],
    );
  });

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (e) => {
      const x = e.nativeEvent.locationX;
      activeIdxRef.current = findTargetIdxRef.current(x);
      phaseRef.current = 'pressing';

      // Start long press timer: vibrate + enter grab state on success
      longPressTimerRef.current = setTimeout(() => {
        phaseRef.current = 'grabbed';
        Vibration.vibrate(30);
        setActiveTabIdx(activeIdxRef.current);
      }, LONG_PRESS_MS);
    },

    onPanResponderMove: (e, gs) => {
      const absDx = Math.abs(gs.dx);

      // PRESSING: if user moves too much before long press fires → cancel
      if (phaseRef.current === 'pressing') {
        if (absDx > CANCEL_BEFORE_GRAB_PX) {
          if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
          phaseRef.current = 'cancelled';
        }
        return;
      }

      // GRABBED: transition to dragging once movement threshold is crossed
      if (phaseRef.current === 'grabbed') {
        if (absDx > DRAG_THRESHOLD_PX) phaseRef.current = 'dragging';
        return;
      }

      // DRAGGING: update order based on finger position
      if (phaseRef.current === 'dragging') {
        const x = e.nativeEvent.locationX;
        const targetIdx = findTargetIdxRef.current(x);
        if (targetIdx >= 0 && targetIdx !== activeIdxRef.current) {
          const newOrder = [...localOrderRef.current];
          const [removed] = newOrder.splice(activeIdxRef.current, 1);
          newOrder.splice(targetIdx, 0, removed);
          activeIdxRef.current = targetIdx;
          localOrderRef.current = newOrder;
          setLocalOrder([...newOrder]);
        }
      }
    },

    onPanResponderRelease: () => {
      if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }

      const phase = phaseRef.current;
      const idx = activeIdxRef.current;

      if (phase === 'pressing') {
        // Plain tap → select wallet
        const wallet = localOrderRef.current[idx];
        if (wallet) callbacksRef.current.onSelect(wallet.id);
      } else if (phase === 'grabbed') {
        // Long pressed, no movement → delete confirmation
        showDeleteDialogRef.current(idx);
      } else if (phase === 'dragging') {
        // Drag released → commit reorder
        callbacksRef.current.onReorder(localOrderRef.current);
      }
      // 'cancelled' → do nothing

      phaseRef.current = 'idle';
      activeIdxRef.current = -1;
      setActiveTabIdx(-1);
    },

    onPanResponderTerminate: () => {
      if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
      phaseRef.current = 'idle';
      activeIdxRef.current = -1;
      setActiveTabIdx(-1);
    },
  }), []); // Stable — all mutable state accessed via refs

  return (
    <View style={styles.container}>
      {/* Draggable tab area (PanResponder covers this View only) */}
      <View style={styles.tabArea} {...panResponder.panHandlers}>
        {localOrder.map((w, i) => {
          const isSelected = w.id === selectedWalletId;
          const isActive = i === activeTabIdx;
          const tabTheme = themes[w.themeId as keyof typeof themes] ?? themes.waiwai;
          return (
            <View
              key={w.id}
              style={[
                styles.tab,
                isSelected
                  ? [styles.tabSelected, { borderColor: tabTheme.primary, backgroundColor: tabTheme.primary + '18' }]
                  : styles.tabInactive,
                isActive && styles.tabGrabbed,
              ]}
              onLayout={(e) => {
                tabLayoutsRef.current[i] = {
                  x: e.nativeEvent.layout.x,
                  width: e.nativeEvent.layout.width,
                };
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  isSelected
                    ? [styles.tabTextSelected, { color: tabTheme.primary }]
                    : styles.tabTextInactive,
                ]}
                numberOfLines={1}
              >
                {w.name}
              </Text>
            </View>
          );
        })}
      </View>

      {/* ＋ button: always rightmost, outside PanResponder, never draggable */}
      <Pressable
        style={[
          styles.tab,
          isAtLimit
            ? styles.tabAddDisabled
            : [styles.tabAdd, { borderColor: currentTheme.primary }],
        ]}
        onPress={onAdd}
      >
        <Text style={[styles.tabAddText, !isAtLimit && { color: currentTheme.primary }]}>＋</Text>
      </Pressable>

      {/* Settings */}
      <Pressable style={styles.settingsButton} onPress={onSettings}>
        <Text style={styles.settingsButtonText}>⚙</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 4,
  },
  tabArea: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 60,
    maxWidth: 110,
  },
  tabSelected: {},
  tabInactive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(141,110,0,0.2)',
  },
  tabGrabbed: {
    opacity: 0.65,
    transform: [{ scale: 1.06 }],
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabTextSelected: {
    fontWeight: '800',
  },
  tabTextInactive: {
    color: 'rgba(93,58,0,0.45)',
  },
  tabAdd: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    minWidth: 36,
    maxWidth: 36,
    paddingHorizontal: 8,
  },
  tabAddDisabled: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(200,160,0,0.2)',
    minWidth: 36,
    maxWidth: 36,
    paddingHorizontal: 8,
  },
  tabAddText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(141,110,0,0.4)',
    textAlign: 'center',
  },
  settingsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingsButtonText: {
    fontSize: 18,
    color: '#5D3A00',
  },
});
