import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText } from '@/components/brand';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { timings } from '@/theme/motion';

const BAR_HEIGHT = 4;
const RANK_WIDTH = 20;

export type RankedRow = { name: string; count: number; share: number };

interface RankedListProps {
  /** Best first. `share` is the row's count over the top row's, 0 to 1. */
  rows: RankedRow[];
  /** The text at the end of a row, e.g. `9 trips`. */
  countLabel: (count: number) => string;
}

const Row = ({
  rank,
  row,
  countLabel,
  last,
}: {
  rank: number;
  row: RankedRow;
  countLabel: (count: number) => string;
  last: boolean;
}): ReactNode => {
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.set(withTiming(Math.min(1, Math.max(0, row.share)), timings.enter));
  }, [row.share, fill]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));

  return (
    <View style={[styles.row, !last && styles.divider]}>
      <AppText variant="coord" color={colors.amber} style={styles.rank}>
        {rank}
      </AppText>
      <View style={styles.main}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {row.name}
        </AppText>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
      </View>
      <AppText variant="coord" color={colors.inkMuted}>
        {countLabel(row.count)}
      </AppText>
    </View>
  );
};

/** A ranked list with a thin amber bar under each name, sized against the top row. */
export const RankedList = ({ rows, countLabel }: RankedListProps): ReactNode => (
  <View>
    {rows.map((row, index) => (
      <Row
        key={row.name}
        rank={index + 1}
        row={row}
        countLabel={countLabel}
        last={index === rows.length - 1}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3] },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  rank: { width: RANK_WIDTH },
  main: { flex: 1, gap: space[2] - 2 },
  track: { height: BAR_HEIGHT, borderRadius: radius.pill, backgroundColor: colors.surfaceOverlay },
  fill: { height: BAR_HEIGHT, borderRadius: radius.pill, backgroundColor: colors.amber },
});
