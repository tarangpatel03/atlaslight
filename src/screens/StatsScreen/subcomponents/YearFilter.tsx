import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '@/components/inputs';
import { useWindowClass } from '@/hooks/useWindowClass';
import { space } from '@/theme/layout';
import type { StatsFilter } from '@/utils/stats.util';

interface YearFilterProps {
  filter: StatsFilter;
  /** Start years that have journeys, newest first: one chip each. */
  years: number[];
  onChange: (filter: StatsFilter) => void;
  /** Runs the row out to the screen edges so a cut-off chip shows it scrolls. Off beside a title. */
  bleed?: boolean;
}

/** Horizontally scrolling chips: All time, then one per year. */
export const YearFilter = ({
  filter,
  years,
  onChange,
  bleed = true,
}: YearFilterProps): ReactNode => {
  const { margin } = useWindowClass();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={bleed ? [styles.scroll, { marginHorizontal: -margin }] : styles.inline}
      contentContainerStyle={[styles.chips, bleed && { paddingHorizontal: margin }]}
    >
      <Chip label="All time" selected={filter === 'all'} onPress={() => onChange('all')} />
      {years.map((year) => (
        <Chip
          key={year}
          label={String(year)}
          selected={filter === year}
          onPress={() => onChange(year)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Room above and below so a pressed chip's hit area is not clipped.
  scroll: { flexGrow: 0 },
  inline: { flexGrow: 0, flexShrink: 1 },
  chips: { gap: space[2], paddingVertical: space[1] },
});
