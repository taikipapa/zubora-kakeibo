import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import type { ThemeId } from '../../types/settings';
import type { TransactionType } from '../../types/transaction';

export interface MoneyAnimationHandle {
  play: (type: TransactionType, amount: number) => void;
}

interface Props {
  themeId: ThemeId;
}

type ParticleKind = 'coin' | 'bill';

type ParticleConfig = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

// Each anim item owns its kind, Animated values, and trajectory.
// Unique id per play() call ensures React unmounts old items and mounts new ones.
interface AnimItem {
  id: string;
  kind: ParticleKind;
  pos: Animated.ValueXY;
  opacity: Animated.Value;
  config: ParticleConfig;
  delay: number;
}

// Income: particles rise from below and are absorbed into the wallet mouth (top)
const INCOME_CONFIGS: ParticleConfig[] = [
  { startX:   0, startY:  95, endX:   0, endY: -95 }, // center
  { startX: -38, startY:  80, endX:  -6, endY: -90 }, // left
  { startX:  38, startY:  80, endX:   6, endY: -90 }, // right
  { startX: -55, startY:  72, endX: -14, endY: -85 }, // far-left
  { startX:  55, startY:  72, endX:  14, endY: -85 }, // far-right
  { startX: -18, startY:  88, endX:  -3, endY: -93 }, // extra
];

// Expense: particles exit from the wallet mouth and disperse downward
const EXPENSE_CONFIGS: ParticleConfig[] = [
  { startX:   0, startY: -95, endX:   0, endY: 100 }, // center
  { startX:  -6, startY: -90, endX: -48, endY:  85 }, // left
  { startX:   6, startY: -90, endX:  48, endY:  85 }, // right
  { startX: -14, startY: -85, endX: -65, endY:  72 }, // far-left
  { startX:  14, startY: -85, endX:  65, endY:  72 }, // far-right
  { startX:  -3, startY: -93, endX: -18, endY:  90 }, // extra
];

const DURATION = 1800;

/** Determine particle kinds based on amount. */
function resolveParticles(amount: number): ParticleKind[] {
  if (amount < 100)   return ['coin'];
  if (amount < 500)   return ['coin', 'coin'];
  if (amount < 1000)  return ['coin', 'coin', 'coin'];
  if (amount < 5000)  return ['coin', 'coin', 'coin', 'bill'];
  if (amount < 10000) return ['coin', 'coin', 'bill', 'bill', 'bill'];
  return               ['coin', 'bill', 'bill', 'bill', 'bill', 'bill'];
}

const COIN_IMAGES: Record<ThemeId, ImageSourcePropType | null> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  waiwai:   require('../../assets/images/money/waiwai-coin.png'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  hokkori:  require('../../assets/images/money/hokkori-coin.png'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  princess: require('../../assets/images/money/princess-coin.png'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prince:   require('../../assets/images/money/prince-coin.png'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  host:     require('../../assets/images/money/host-coin.png'),
};

const BILL_IMAGES: Record<ThemeId, ImageSourcePropType | null> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  waiwai:   require('../../assets/images/money/waiwai-bill.png'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  hokkori:  require('../../assets/images/money/hokkori-bill.png'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  princess: require('../../assets/images/money/princess-bill.png'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prince:   require('../../assets/images/money/prince-bill.png'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  host:     require('../../assets/images/money/host-bill.png'),
};

let playCounter = 0;

export const MoneyAnimation = forwardRef<MoneyAnimationHandle, Props>(({ themeId }, ref) => {
  // animItems holds the complete state for the current play() call.
  // Each item owns its kind and Animated values — no shared pool.
  const [animItems, setAnimItems] = useState<AnimItem[]>([]);

  // pendingAnimRef holds items whose animation should start after the next render.
  const pendingAnimRef = useRef<AnimItem[] | null>(null);

  // After React renders the new animItems (with correct kind/image),
  // start the animation. This guarantees the native image is already
  // on screen before opacity becomes 1.
  useEffect(() => {
    const items = pendingAnimRef.current;
    if (!items || items.length === 0) return;
    pendingAnimRef.current = null;

    const anims = items.map(item => {
      item.pos.setValue({ x: item.config.startX, y: item.config.startY });
      item.opacity.setValue(1);

      const move = Animated.parallel([
        Animated.timing(item.pos, {
          toValue: { x: item.config.endX, y: item.config.endY },
          duration: DURATION - item.delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(item.opacity, {
          toValue: 0,
          duration: DURATION - item.delay,
          useNativeDriver: true,
        }),
      ]);

      return item.delay > 0
        ? Animated.sequence([Animated.delay(item.delay), move])
        : move;
    });

    Animated.parallel(anims).start();
  }, [animItems]);

  useImperativeHandle(ref, () => ({
    play(type: TransactionType, amount: number) {
      const configs = type === 'income' ? INCOME_CONFIGS : EXPENSE_CONFIGS;
      const kinds = resolveParticles(amount);
      const count = kinds.length;
      const delayStep = count > 1 ? Math.floor(500 / (count - 1)) : 0;

      // Build a fresh set of items — each with its own Animated values and kind.
      // A unique id per play() call forces React to unmount old items and mount
      // new ones, so the previous kind/image can never bleed into this animation.
      playCounter += 1;
      const playId = playCounter;

      const items: AnimItem[] = kinds.map((kind, i) => ({
        id: `${playId}-${i}`,
        kind,
        pos: new Animated.ValueXY({ x: 0, y: 500 }), // offscreen until useEffect
        opacity: new Animated.Value(0),               // hidden until useEffect
        config: configs[i] ?? configs[0]!,
        delay: i * delayStep,
      }));

      // Store for useEffect to consume after render
      pendingAnimRef.current = items;

      // Trigger render with new items — correct kind/image on screen before opacity=1
      setAnimItems(items);
    },
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {animItems.map(item => {
        const image =
          item.kind === 'bill'
            ? (BILL_IMAGES[themeId] ?? COIN_IMAGES[themeId] ?? null)
            : (COIN_IMAGES[themeId] ?? null);

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.particle,
              {
                opacity: item.opacity,
                transform: [
                  { translateX: item.pos.x },
                  { translateY: item.pos.y },
                ],
              },
            ]}
          >
            {image ? (
              <Image
                source={image}
                style={item.kind === 'bill' ? styles.billImage : styles.coinImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.symbol}>¥</Text>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  coinImage: {
    width: 56,
    height: 56,
    marginTop: -28,
    marginLeft: -28,
  },
  billImage: {
    width: 100,
    height: 100,
    marginTop: -50,
    marginLeft: -50,
  },
  symbol: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF8F00',
    marginTop: -13,
    marginLeft: -9,
  },
});
