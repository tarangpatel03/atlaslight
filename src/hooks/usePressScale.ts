import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PRESS_SCALE, timings } from '@/theme/motion';

interface PressScale {
  style: ReturnType<typeof useAnimatedStyle>;
  handlers: { onPressIn: () => void; onPressOut: () => void };
}

/** Press feedback: scales down while pressed. Spread `handlers` on a Pressable and `style` on an Animated.View. */
export const usePressScale = (scaleTo: number = PRESS_SCALE): PressScale => {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  // get()/set() instead of .value keep the React Compiler lint rules happy with shared values.
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const animateTo = (value: number): void => {
    scale.set(
      reduceMotion
        ? value
        : withTiming(value, timings.fade),
    );
  };

  return {
    style,
    handlers: {
      onPressIn: () => animateTo(scaleTo),
      onPressOut: () => animateTo(1),
    },
  };
};
