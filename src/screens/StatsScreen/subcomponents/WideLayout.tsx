import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '@/theme/layout';
import { formatMonthYear } from '@/utils/format.util';
import { DistanceCard } from './DistanceCard';
import { StatsHeader } from './StatsHeader';
import type { StatsBodyProps } from './statsBody.types';
import { StatTiles } from './StatTiles';
import { WideScratchMap } from './WideScratchMap';
import { WishlistCard } from './WishlistCard';
import { YearFilter } from './YearFilter';
import { YearsCard } from './YearsCard';

/** Two tiles must fit side by side in a middle column about 320 dp wide. */
const MIDDLE_TILE_BASIS = 110;

/** The 2-column dashboard for windows 900 dp and wider (tablet landscape, an unfolded foldable). */
export const WideLayout = ({
  stats,
  years,
  filter,
  units,
  highlightYear,
  onFilterChange,
}: StatsBodyProps): ReactNode => (
  <View style={styles.wide}>
    <View style={styles.header}>
      <StatsHeader
        wide
        since={stats.firstJourneyAt === null ? null : formatMonthYear(stats.firstJourneyAt, 'long')}
      />
      <YearFilter bleed={false} filter={filter} years={years} onChange={onFilterChange} />
    </View>
    <View style={styles.row}>
      <DistanceCard
        style={styles.fill}
        distanceKm={stats.distanceKm}
        earthFraction={stats.earthFraction}
        units={units}
      />
      <StatTiles
        style={styles.fill}
        stats={stats}
        allTime={filter === 'all'}
        show={['countries', 'journeys']}
      />
    </View>
    <View style={styles.row}>
      <View style={styles.mapColumn}>
        <WideScratchMap visited={stats.visited} countryCount={stats.countryCount} />
      </View>
      <View style={styles.column}>
        <StatTiles
          stats={stats}
          allTime={filter === 'all'}
          show={['memories', 'highest']}
          tileBasis={MIDDLE_TILE_BASIS}
        />
        <YearsCard compact data={stats.journeysPerYear} highlightYear={highlightYear} />
      </View>
    </View>
    <WishlistCard />
  </View>
);

const styles = StyleSheet.create({
  wide: { gap: space[4] },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space[4],
  },
  row: { flexDirection: 'row', gap: space[4] },
  fill: { flex: 1 },
  mapColumn: { flex: 1.3 },
  column: { flex: 1, gap: space[4] },
});
