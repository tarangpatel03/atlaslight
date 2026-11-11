import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import { Easing, LinearTransition } from 'react-native-reanimated';

export const springs = {
  /** Presses, pins, switches. */
  standard: { damping: 20, stiffness: 220, mass: 1 },
  /** Sheets, side panels, layout changes. */
  gentle: { damping: 26, stiffness: 180, mass: 1 },
  /** Pin drop: a small overshoot. */
  pinDrop: { damping: 12, stiffness: 260, mass: 0.8 },
} satisfies Record<string, WithSpringConfig>;

export const durations = {
  fast: 150, // press feedback, fades
  base: 250, // enter / leave
  slow: 400, // screen-level
  countUp: 800, // stat numbers, first view only
} as const;

export const timings = {
  fade: { duration: durations.fast, easing: Easing.out(Easing.quad) },
  enter: { duration: durations.base, easing: Easing.out(Easing.cubic) },
  countUp: { duration: durations.countUp, easing: Easing.out(Easing.cubic) },
} satisfies Record<string, WithTimingConfig>;

/** Rows sliding into place when a list item is added, removed or moved (the `gentle` spring). */
export const rowTransition = LinearTransition.springify()
  .damping(springs.gentle.damping)
  .stiffness(springs.gentle.stiffness)
  .mass(springs.gentle.mass);

/** Scale applied while a pressable is held. */
export const PRESS_SCALE = 0.97;

/** Route replay speed: ~1.5s per 1,000 km, clamped so short trips still read and long ones don't drag. */
export const routeReplayDuration = (km: number): number =>
  Math.min(6000, Math.max(1200, (km / 1000) * 1500));
