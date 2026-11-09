import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '@/components/inputs';
import { useWindowClass } from '@/hooks/useWindowClass';
import { space } from '@/theme/layout';
import type { JourneyFilter } from '@/utils/journey.util';

interface FilterBarProps {
  filter: JourneyFilter;
  /** Start years that have journeys, newest first: one chip each. */
  years: number[];
  onChange: (filter: JourneyFilter) => void;
}

/** Horizontally scrolling filter chips: All, Ongoing, one per year, Favourites. */
export const FilterBar = ({ filter, years, onChange }: FilterBarProps): ReactNode => {
  const { margin } = useWindowClass();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // The row runs out to the screen edge (negative margin) so a cut-off chip shows it scrolls.
      style={[styles.scroll, { marginHorizontal: -margin }]}
      contentContainerStyle={[styles.chips, { paddingHorizontal: margin }]}
    >
      <Chip label="All" selected={filter === 'all'} onPress={() => onChange('all')} />
      <Chip label="Ongoing" selected={filter === 'ongoing'} onPress={() => onChange('ongoing')} />
      {years.map((year) => (
        <Chip
          key={year}
          label={String(year)}
          selected={filter === year}
          onPress={() => onChange(year)}
        />
      ))}
      <Chip
        label="Favourites"
        selected={filter === 'favourites'}
        onPress={() => onChange('favourites')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Room above and below so a pressed chip's hit area is not clipped.
  scroll: { flexGrow: 0, marginTop: space[4] },
  chips: { gap: space[2], paddingVertical: space[1] },
});
