import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { AppText } from '@/components/brand';
import { ScratchMap } from '@/components/charts';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import type { VisitedRegions } from '@/utils/region.util';
import { scratchMapHeight } from '@/utils/scratchMap.util';
import { SectionTitle } from './SectionTitle';

interface ScratchMapCardProps {
  visited: VisitedRegions;
  countryCount: number;
  /** A first guess of the card's width in dp; the measured width replaces it once laid out. */
  width: number;
}

const Legend = (): ReactNode => (
  <View style={styles.legend}>
    <View style={styles.dot} />
    <AppText variant="label" color={colors.inkMuted}>
      Visited
    </AppText>
  </View>
);

/** The world's countries with the visited ones filled, and how many that is. */
export const ScratchMapCard = ({
  visited,
  countryCount,
  width,
}: ScratchMapCardProps): ReactNode => {
  const [cardWidth, setCardWidth] = useState(width);
  const onLayout = (event: LayoutChangeEvent): void => setCardWidth(event.nativeEvent.layout.width);

  return (
    <View style={styles.section}>
      <SectionTitle title="Scratch map" right={<Legend />} />
      <View onLayout={onLayout} style={styles.card}>
        <View style={{ height: scratchMapHeight(cardWidth) }}>
          <ScratchMap visited={visited} />
        </View>
        {/* Under the map, not over it, so it never covers a state. */}
        <View style={styles.footer}>
          <AppText variant="caption" color={colors.inkMuted}>
            <AppText variant="caption" color={colors.amber}>
              {countryCount}
            </AppText>
            {countryCount === 1 ? ' country' : ' countries'}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: space[3] },
  card: { borderRadius: radius.lg, overflow: 'hidden' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  dot: {
    width: space[2],
    height: space[2],
    borderRadius: radius.pill,
    backgroundColor: colors.amber,
  },
  footer: { padding: space[3], backgroundColor: colors.mapWater },
});
