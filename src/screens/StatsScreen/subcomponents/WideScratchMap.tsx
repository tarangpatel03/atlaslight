import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { ScratchMap } from '@/components/charts';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import type { VisitedRegions } from '@/utils/region.util';

/** Keeps the map readable when the row around it is short. */
const MIN_CARD_HEIGHT = 360;

interface WideScratchMapProps {
  visited: VisitedRegions;
  countryCount: number;
}

/** The wide layout's scratch map: a title above the map, the country count below. */
export const WideScratchMap = ({ visited, countryCount }: WideScratchMapProps): ReactNode => (
  <View style={styles.card}>
    <View style={styles.header}>
      <AppText variant="subheading">Scratch map</AppText>
    </View>
    <View style={styles.map}>
      <ScratchMap visited={visited} />
    </View>
    <View style={styles.footer}>
      <AppText variant="caption" color={colors.inkMuted}>
        <AppText variant="caption" color={colors.amber}>
          {countryCount}
        </AppText>
        {countryCount === 1 ? ' country' : ' countries'}
      </AppText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: MIN_CARD_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.mapWater,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space[4],
  },
  map: { flex: 1 },
  footer: { padding: space[4] },
});
