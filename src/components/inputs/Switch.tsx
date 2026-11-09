import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { radius, sizes } from '@/theme/layout';
import { springs } from '@/theme/motion';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const THUMB = 24;
const INSET = (TRACK_HEIGHT - THUMB) / 2;
const TRAVEL = TRACK_WIDTH - THUMB - INSET * 2;
/** Extends the 32 dp track to the 48 dp touch minimum. */
const HIT_SLOP = (sizes.touchMin - TRACK_HEIGHT) / 2;

/** On/off switch: amber when on. The thumb springs; with Reduce Motion it jumps. */
export const Switch = ({ value, onValueChange, disabled = false }: SwitchProps): ReactNode => {
  const progress = useSharedValue(value ? 1 : 0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const target = value ? 1 : 0;
    progress.set(reduceMotion ? target : withSpring(target, springs.standard));
  }, [value, reduceMotion, progress]);

  // get() instead of .value keeps the React Compiler lint rules happy with shared values.
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], ['transparent', colors.amber]),
    borderColor: interpolateColor(progress.get(), [0, 1], [colors.controlBorder, colors.amber]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.inkMuted, colors.onAmber]),
    transform: [{ translateX: progress.get() * TRAVEL }],
  }));

  return (
    <Pressable disabled={disabled} hitSlop={HIT_SLOP} onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.track, disabled && styles.disabled, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.pill,
    // Track border is 1.5, so this centres the thumb inside it.
    marginLeft: INSET - 1.5,
  },
  disabled: { opacity: 0.5 },
});
