import type { DistanceUnit } from '@/store/slices';
import type { Stats, StatsFilter } from '@/utils/stats.util';

/** What both layouts of the Stats screen draw from. */
export interface StatsBodyProps {
  stats: Stats;
  /** Start years that have journeys, newest first: one chip each. */
  years: number[];
  /** The year in effect ('all' when the chosen year has no journeys any more). */
  filter: StatsFilter;
  units: DistanceUnit;
  /** The bar drawn in full colour in the journeys-per-year chart. */
  highlightYear: number;
  onFilterChange: (filter: StatsFilter) => void;
}
