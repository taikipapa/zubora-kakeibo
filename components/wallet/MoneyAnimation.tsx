import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import type { TransactionType } from '../../types/transaction';

export interface MoneyAnimationHandle {
  play: (type: TransactionType) => void;
}

type ParticleConfig = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
};

// Income: ¥ rises from outside (below) and is absorbed into the wallet opening (top)
const INCOME_CONFIGS: ParticleConfig[] = [
  { startX: -42, startY:  80, endX:  -8, endY: -60, delay:   0 },
  { startX:   0, startY:  95, endX:   0, endY: -70, delay:  80 },
  { startX:  42, startY:  80, endX:   8, endY: -60, delay: 160 },
];

// Expense: ¥ exits from the wallet opening and disperses outward/downward
const EXPENSE_CONFIGS: ParticleConfig[] = [
  { startX:  -8, startY: -60, endX: -55, endY:  85, delay:   0 },
  { startX:   0, startY: -70, endX:   0, endY: 100, delay:  80 },
  { startX:   8, startY: -60, endX:  55, endY:  85, delay: 160 },
];

const DURATION = 720;
const NUM_PARTICLES = 3;

export const MoneyAnimation = forwardRef<MoneyAnimationHandle, {}>((_, ref) => {
  const particles = useRef(
    Array.from({ length: NUM_PARTICLES }, () => ({
      pos: new Animated.ValueXY({ x: 0, y: 500 }),
      opacity: new Animated.Value(0),
    })),
  ).current;

  useImperativeHandle(ref, () => ({
    play(type: TransactionType) {
      const configs = type === 'income' ? INCOME_CONFIGS : EXPENSE_CONFIGS;

      const anims = configs.map((cfg, i) => {
        const p = particles[i];
        if (!p) return Animated.delay(0);

        p.pos.setValue({ x: cfg.startX, y: cfg.startY });
        p.opacity.setValue(1);

        const move = Animated.parallel([
          Animated.timing(p.pos, {
            toValue: { x: cfg.endX, y: cfg.endY },
            duration: DURATION - cfg.delay,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: DURATION - cfg.delay,
            useNativeDriver: true,
          }),
        ]);

        return cfg.delay > 0
          ? Animated.sequence([Animated.delay(cfg.delay), move])
          : move;
      });

      Animated.parallel(anims).start();
    },
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              opacity: p.opacity,
              transform: [{ translateX: p.pos.x }, { translateY: p.pos.y }],
            },
          ]}
        >
          <Text style={styles.symbol}>¥</Text>
        </Animated.View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -13,
    marginLeft: -9,
  },
  symbol: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF8F00',
  },
});
