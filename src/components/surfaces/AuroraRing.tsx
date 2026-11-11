import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { auroraGradient, colors } from '@/theme/colors';
import { timings } from '@/theme/motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AuroraRingProps {
  /** 0 to 1; values outside are clamped. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Centred inside the ring. */
  children?: ReactNode;
}

/** Progress ring with the aurora (teal to violet) arc. Fills once on mount. */
export const AuroraRing = ({
  progress,
  size = 96,
  strokeWidth = 8,
  children,
}: AuroraRingProps): ReactNode => {
  const target = Math.min(1, Math.max(0, progress));
  const fill = useSharedValue(0);
  const center = size / 2;
  const ringRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  useEffect(() => {
    fill.set(withTiming(target, timings.countUp));
  }, [target, fill]);

  // get() instead of .value keeps the React Compiler lint rules happy with shared values.
  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - fill.get()),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="auroraRing" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={auroraGradient[0]} />
            <Stop offset="1" stopColor={auroraGradient[1]} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke={colors.surfaceOverlay}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke="url(#auroraRing)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          fill="none"
          rotation={-90}
          origin={`${center}, ${center}`}
          animatedProps={arcProps}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
