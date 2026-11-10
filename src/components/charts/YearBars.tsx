import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText } from '@/components/brand';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { timings } from '@/theme/motion';
import { formatShortYear } from '@/utils/format.util';
import { AuroraFill } from './AuroraFill';

/** Height of the count label above a bar (the `coord` line height). */
const LABEL_HEIGHT = 16;
/** The quieter bars are the aurora's teal at this strength; the highlighted one gets the full gradient. */
const QUIET_OPACITY = 0.55;

export type YearCount = { year: number; count: number };

interface YearBarsProps {
  /** Years in ascending order, gap years included as zero. */
  data: YearCount[];
  /** The year drawn in full colour (the chosen chip, or the latest year). */
  highlightYear: number;
  /** Only the latest years fit a phone; older ones are dropped. */
  maxBars?: number;
  /** Height of the bars area, counts included. */
  height?: number;
}

interface BarProps {
  count: number;
  max: number;
  room: number;
  highlighted: boolean;
}

const Bar = ({ count, max, room, highlighted }: BarProps): ReactNode => {
  const grow = useSharedValue(0);

  useEffect(() => {
    grow.set(withTiming(1, timings.countUp));
  }, [grow]);

  // The bar is laid out at its final height and grown with a scale: animating `height` would leave
  // the gradient inside it at a stale size.
  const barStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: grow.get() }] }));
  const barHeight = max > 0 ? (count / max) * room : 0;

  return (
    <View style={styles.column}>
      <AppText variant="coord" color={highlighted ? colors.ink : colors.inkMuted}>
        {count}
      </AppText>
      <Animated.View
        style={[styles.bar, highlighted ? null : styles.barQuiet, { height: barHeight }, barStyle]}
      >
        {highlighted ? <AuroraFill direction="vertical" /> : null}
      </Animated.View>
    </View>
  );
};

/** Journeys per year as bars, with the year on the axis. The bars grow once when first shown. */
export const YearBars = ({
  data,
  highlightYear,
  maxBars = 6,
  height = 140,
}: YearBarsProps): ReactNode => {
  const shown = data.slice(-maxBars);
  const max = Math.max(0, ...shown.map((item) => item.count));
  const room = height - LABEL_HEIGHT - space[1];

  return (
    <View>
      <View style={[styles.bars, { height }]}>
        {shown.map((item) => (
          <Bar
            key={item.year}
            count={item.count}
            max={max}
            room={room}
            highlighted={item.year === highlightYear}
          />
        ))}
      </View>
      <View style={styles.axis}>
        {shown.map((item) => (
          <View key={item.year} style={styles.column}>
            <AppText
              variant="coord"
              color={item.year === highlightYear ? colors.ink : colors.inkSubtle}
            >
              {formatShortYear(item.year)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  axis: { flexDirection: 'row', gap: space[3], paddingTop: space[2] },
  column: { flex: 1, alignItems: 'center', gap: space[1] },
  bar: {
    width: '100%',
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    overflow: 'hidden',
    transformOrigin: 'bottom',
  },
  barQuiet: { backgroundColor: colors.auroraTeal, opacity: QUIET_OPACITY },
});
