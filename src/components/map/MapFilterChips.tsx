import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '@/components/inputs';
import { space } from '@/theme/layout';
import type { MapFilter } from '@/utils/mapFeatures.util';

interface MapFilterChipsProps {
  filter: MapFilter;
  /** One chip per journey that has memories on the map. */
  journeys: { id: string; title: string }[];
  /** Space kept on the left and right of the row, so it lines up with the search bar. */
  gutter: number;
  /** How many places are on the wishlist. */
  wishCount: number;
  onChange: (filter: MapFilter) => void;
  onOpenWishlist: () => void;
}

/** Chips over the map: All, Ongoing, Favourites filters, the Wishlist shortcut, then one filter per journey. */
export const MapFilterChips = ({
  filter,
  journeys,
  gutter,
  wishCount,
  onChange,
  onOpenWishlist,
}: MapFilterChipsProps): ReactNode => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    contentContainerStyle={[styles.row, { paddingHorizontal: gutter }]}
    style={styles.scroll}
  >
    <Chip label="All" selected={filter.kind === 'all'} onPress={() => onChange({ kind: 'all' })} />
    <Chip
      label="Ongoing"
      variant="live"
      selected={filter.kind === 'ongoing'}
      onPress={() => onChange({ kind: 'ongoing' })}
    />
    <Chip
      label="Favourites"
      icon="heart"
      selected={filter.kind === 'favourites'}
      onPress={() => onChange({ kind: 'favourites' })}
    />
    <Chip
      label={wishCount > 0 ? `Wishlist · ${wishCount}` : 'Wishlist'}
      variant="wish"
      onPress={onOpenWishlist}
    />
    {journeys.map((journey) => (
      <Chip
        key={journey.id}
        label={journey.title}
        selected={filter.kind === 'journey' && filter.journeyId === journey.id}
        onPress={() => onChange({ kind: 'journey', journeyId: journey.id })}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { gap: space[2], alignItems: 'center' },
});
