import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { StatTile } from '@/components/surfaces';
import { space } from '@/theme/layout';
import type { Stats } from '@/utils/stats.util';

export type StatTileKey = 'countries' | 'journeys' | 'memories' | 'highest';

const ALL_TILES: StatTileKey[] = ['countries', 'journeys', 'memories', 'highest'];

interface StatTilesProps {
  stats: Stats;
  /** All time (the "+2 this year" line) rather than one chosen year. */
  allTime: boolean;
  /** Which tiles to draw, in the order of the design; all four by default. */
  show?: StatTileKey[];
  /** Lets a row size the grid, e.g. `{ flex: 1 }`. */
  style?: StyleProp<ViewStyle>;
  /** Width each tile asks for; less than the default keeps two tiles side by side in a narrow column. */
  tileBasis?: number;
}

/** `2,940 photos`, with the thousands separator the tiles use. */
const counted = (count: number, singular: string, plural: string): string =>
  `${count.toLocaleString('en-US')} ${count === 1 ? singular : plural}`;

/** Countries, journeys, memories and the highest point. */
export const StatTiles = ({
  stats,
  allTime,
  show = ALL_TILES,
  style,
  tileBasis,
}: StatTilesProps): ReactNode => (
  <View style={[styles.grid, style]}>
    {show.includes('countries') ? (
      <StatTile
        labelFirst
        basis={tileBasis}
        value={stats.countryCount}
        label="Countries"
        sub={
          stats.newCountries > 0
            ? `+${stats.newCountries} ${allTime ? 'this year' : `in ${stats.basisYear}`}`
            : undefined
        }
      />
    ) : null}
    {show.includes('journeys') ? (
      <StatTile
        labelFirst
        basis={tileBasis}
        value={stats.journeyCount}
        label="Journeys"
        sub={`${counted(stats.daysAway, 'day', 'days')} away`}
      />
    ) : null}
    {show.includes('memories') ? (
      <StatTile
        labelFirst
        basis={tileBasis}
        value={stats.memoryCount}
        label="Memories"
        sub={counted(stats.photoCount, 'photo', 'photos')}
      />
    ) : null}
    {show.includes('highest') && stats.highestPoint ? (
      <StatTile
        labelFirst
        basis={tileBasis}
        value={stats.highestPoint.altitude}
        unit="m"
        label="Highest point"
        sub={stats.highestPoint.name}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  // Stretching the lines lets a grid that a row made taller grow its tiles with it.
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], alignContent: 'stretch' },
});
