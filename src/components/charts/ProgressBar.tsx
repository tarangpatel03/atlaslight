import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/layout';
import { timings } from '@/theme/motion';
import { AuroraFill } from './AuroraFill';

const BAR_HEIGHT = 6;

interface ProgressBarProps {
  /** 0 to 1; values outside are clamped. */
  progress: number;
}

/** Thin progress bar with the aurora fill. The fill grows once when the bar first appears. */
export const ProgressBar = ({ progress }: ProgressBarProps): ReactNode => {
  const target = Math.min(1, Math.max(0, progress));
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.set(withTiming(target, timings.countUp));
  }, [target, fill]);

  // get() instead of .value keeps the React Compiler lint rules happy with shared values.
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]}>
        <AuroraFill direction="horizontal" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceOverlay,
  },
  fill: { height: BAR_HEIGHT, borderRadius: radius.pill, overflow: 'hidden' },
});
