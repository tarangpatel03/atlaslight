import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '@/theme/layout';
import { formatMonthYear } from '@/utils/format.util';
import { DistanceCard } from './DistanceCard';
import { ScratchMapCard } from './ScratchMapCard';
import { StatsHeader } from './StatsHeader';
import type { StatsBodyProps } from './statsBody.types';
import { StatTiles } from './StatTiles';
import { YearFilter } from './YearFilter';
import { YearsCard } from './YearsCard';

/** Phone Stats is one column; on a wider window it is centred and stops here instead of stretching. */
const COLUMN_MAX_WIDTH = 640;

interface PhoneLayoutProps extends StatsBodyProps {
  /** Width of the screen's content in dp, a first guess for the scratch map's height. */
  width: number;
}

/** The single-column Stats layout: phones and windows up to 899 dp wide. */
export const PhoneLayout = ({
  stats,
  years,
  filter,
  units,
  highlightYear,
  onFilterChange,
  width,
}: PhoneLayoutProps): ReactNode => (
  <View style={styles.column}>
    <View style={styles.top}>
      <StatsHeader
        since={stats.firstJourneyAt === null ? null : formatMonthYear(stats.firstJourneyAt, 'long')}
      />
      <YearFilter filter={filter} years={years} onChange={onFilterChange} />
    </View>
    <View style={styles.hero}>
      <DistanceCard
        distanceKm={stats.distanceKm}
        earthFraction={stats.earthFraction}
        units={units}
      />
      <StatTiles stats={stats} allTime={filter === 'all'} />
    </View>
    <ScratchMapCard
      visited={stats.visited}
      countryCount={stats.countryCount}
      width={Math.min(width, COLUMN_MAX_WIDTH)}
    />
    <YearsCard data={stats.journeysPerYear} highlightYear={highlightYear} />
  </View>
);

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: COLUMN_MAX_WIDTH, alignSelf: 'center', gap: space[6] },
  top: { gap: space[4] },
  /** Distance and the tiles belong together, so they sit closer than the other blocks. */
  hero: { gap: space[3] },
});
