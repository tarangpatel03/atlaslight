import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { durations } from '@/theme/motion';
import type { VisitedRegions } from '@/utils/region.util';
import { buildScratchPaths, type Size } from '@/utils/scratchMap.util';

/** How strongly a visited region is filled (the design's amber at 75%). */
const VISITED_OPACITY = 0.75;

interface ScratchMapProps {
  visited: VisitedRegions;
}

/**
 * The world's countries drawn from the bundled map data, with the visited ones
 * filled amber. It fills its parent, which gives it a height.
 */
export const ScratchMap = ({ visited }: ScratchMapProps): ReactNode => {
  const [size, setSize] = useState<Size | null>(null);
  const paths = useMemo(() => (size ? buildScratchPaths(visited, size) : null), [visited, size]);

  const onLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) => (prev?.width === width && prev.height === height ? prev : { width, height }));
  };

  return (
    <View style={styles.ground} onLayout={onLayout}>
      {size && paths ? (
        <Animated.View entering={FadeIn.duration(durations.base)} style={StyleSheet.absoluteFill}>
          <Svg width={size.width} height={size.height}>
            <Path
              d={paths.land}
              fill={colors.mapLand}
              stroke={colors.mapBorder}
              strokeWidth={1}
              fillRule="evenodd"
            />
            <Path
              d={paths.visited}
              fill={colors.amber}
              fillOpacity={VISITED_OPACITY}
              stroke={colors.mapBorder}
              strokeWidth={1}
              fillRule="evenodd"
            />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  ground: { flex: 1, backgroundColor: colors.mapWater },
});
