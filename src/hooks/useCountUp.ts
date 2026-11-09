import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { durations } from '@/theme/motion';

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Counts from 0 up to `target` once, when the component mounts (design brief: 800 ms, first view only).
 * With Reduce Motion on it returns `target` straight away.
 */
export const useCountUp = (target: number): number => {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    let frame = 0;
    const start = Date.now();
    const tick = (): void => {
      const t = Math.min(1, (Date.now() - start) / durations.countUp);
      setValue(target * easeOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  return reduceMotion ? target : value;
};
