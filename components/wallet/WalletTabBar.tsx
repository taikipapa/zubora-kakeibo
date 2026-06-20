import { useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Alert, Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const SETTINGS_ICON = require('../../assets/images/settings/settings-gear.png');

import { themes } from '../../theme/themes';
import type { Theme } from '../../theme/themes';
import type { Wallet } from '../../types/wallet';

const LONG_PRESS_MS = 450;
const DRAG_THRESHOLD_PX = 8;

function triggerLongPressHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

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
  const [activeTabIdx, setActiveTabIdx] = useState(-1);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const activeTabIdxRef = useRef(-1);
  activeTabIdxRef.current = activeTabIdx;
  useEffect(() => {
    if (activeTabIdxRef.current === -1) setLocalOrder(wallets);
  }, [wallets]);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); };
  }, []);

  const localOrderRef = useRef<Wallet[]>(localOrder);
  localOrderRef.current = localOrder;

  const callbacksRef = useRef({ onSelect, onDelete, onReorder });
  callbacksRef.current = { onSelect, onDelete, onReorder };

  const phaseRef = useRef<GesturePhase>('idle');
  const activeIdxRef = useRef(-1);

  const tabLayoutsRef = useRef<{ x: number; width: number }[]>([]);

  const tabAreaRef = useRef<View>(null);
  const tabAreaPageXRef = useRef(0);
  // Track horizontal scroll offset to correct touch → local coordinate conversion
  const scrollOffsetRef = useRef(0);

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
    // Don't claim on start — allows ScrollView to handle horizontal swipes
    onStartShouldSetPanResponder: () => false,
    // Only claim moves after long-press is confirmed (grabbed/dragging phase)
    onMoveShouldSetPanResponder: () =>
      phaseRef.current === 'grabbed' || phaseRef.current === 'dragging',

    onPanResponderGrant: () => {
      // Granted during 'grabbed' phase when user starts dragging after long-press
      // activeIdxRef.current already set from onTouchStart
    },

    onPanResponderMove: (e, gs) => {
      if (phaseRef.current === 'grabbed') {
        if (Math.abs(gs.dx) > DRAG_THRESHOLD_PX) phaseRef.current = 'dragging';
        return;
      }
      if (phaseRef.current === 'dragging') {
        const localX = e.nativeEvent.pageX - tabAreaPageXRef.current + scrollOffsetRef.current;
        const targetIdx = findTargetIdxRef.current(localX);
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
      if (phaseRef.current === 'dragging') {
        callbacksRef.current.onReorder(localOrderRef.current);
      }
      phaseRef.current = 'idle';
      activeIdxRef.current = -1;
      setActiveTabIdx(-1);
      setScrollEnabled(true);
    },

    onPanResponderTerminate: () => {
      if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
      phaseRef.current = 'idle';
      activeIdxRef.current = -1;
      setActiveTabIdx(-1);
      setScrollEnabled(true);
    },
  }), []);

  return (
    <View style={styles.container}>
      {/* Horizontally scrollable tab list — flex: 1 bounds it before + and settings buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        scrollEnabled={scrollEnabled}
        scrollEventThrottle={16}
        onScroll={(e) => { scrollOffsetRef.current = e.nativeEvent.contentOffset.x; }}
        onScrollBeginDrag={() => {
          // User started scrolling — cancel any pending long-press
          if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
          phaseRef.current = 'cancelled';
          setActiveTabIdx(-1);
        }}
      >
        <View
          ref={tabAreaRef}
          style={styles.tabArea}
          onLayout={() => {
            tabAreaRef.current?.measure((_x, _y, _w, _h, pageX) => {
              // Normalize to scroll=0 position so localX calculation stays correct
              // even when onLayout fires while the ScrollView is scrolled.
              tabAreaPageXRef.current = pageX + scrollOffsetRef.current;
            });
          }}
          onTouchStart={(e) => {
            // Start long-press timer here since PanResponder no longer claims start
            const localX = e.nativeEvent.pageX - tabAreaPageXRef.current + scrollOffsetRef.current;
            activeIdxRef.current = findTargetIdxRef.current(localX);
            phaseRef.current = 'pressing';
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = setTimeout(() => {
              phaseRef.current = 'grabbed';
              triggerLongPressHaptic();
              setActiveTabIdx(activeIdxRef.current);
              setScrollEnabled(false); // Disable scroll so PanResponder can claim drag
            }, LONG_PRESS_MS);
          }}
          onTouchEnd={() => {
            const phase = phaseRef.current;
            const idx = activeIdxRef.current;
            if (phase === 'pressing') {
              if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
              const wallet = localOrderRef.current[idx];
              if (wallet) callbacksRef.current.onSelect(wallet.id);
              phaseRef.current = 'idle';
              activeIdxRef.current = -1;
              setActiveTabIdx(-1);
            } else if (phase === 'grabbed') {
              if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
              showDeleteDialogRef.current(idx);
              phaseRef.current = 'idle';
              activeIdxRef.current = -1;
              setActiveTabIdx(-1);
              setScrollEnabled(true);
            }
            // 'dragging' release is handled by PanResponder's onPanResponderRelease
          }}
          onTouchCancel={() => {
            if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
            if (phaseRef.current !== 'dragging') {
              phaseRef.current = 'idle';
              activeIdxRef.current = -1;
              setActiveTabIdx(-1);
              setScrollEnabled(true);
            }
          }}
          {...panResponder.panHandlers}
        >
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
      </ScrollView>

      {/* ＋ button: always rightmost, outside ScrollView */}
      <Pressable
        style={[
          styles.addBtn,
          isAtLimit
            ? styles.addBtnDisabled
            : [styles.addBtnActive, { borderColor: currentTheme.primary }],
        ]}
        onPress={onAdd}
      >
        <Text style={[styles.addBtnText, !isAtLimit && { color: currentTheme.primary }]}>＋</Text>
      </Pressable>

      {/* Settings */}
      <Pressable style={styles.settingsButton} onPress={onSettings}>
        <Image source={SETTINGS_ICON} style={styles.settingsIcon} resizeMode="contain" />
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
  tabScroll: {
    flex: 1,
  },
  tabArea: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 56,
    maxWidth: 110,
  },
  tabSelected: {},
  tabInactive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(141,110,0,0.2)',
  },
  tabGrabbed: {
    opacity: 0.6,
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
  addBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    minWidth: 30,
    maxWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnActive: {
    backgroundColor: 'transparent',
  },
  addBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(200,160,0,0.2)',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(141,110,0,0.4)',
    textAlign: 'center',
    lineHeight: 16,
  },
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingsIcon: {
    width: 34,
    height: 34,
  },
});
