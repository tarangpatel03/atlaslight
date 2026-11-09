import { FlashList } from '@shopify/flash-list';
import type { ReactElement, ReactNode } from 'react';
import { View } from 'react-native';
import type { JourneyListItem } from '@/api/journeys.api';
import { JourneyItem } from './JourneyItem';

/** Space between cards, in both directions. Each card carries half of it on every side. */
export const GRID_GAP = 16;

interface JourneyGridProps {
  /** Already in display order (ongoing first, then newest). */
  journeys: JourneyListItem[];
  columns: number;
  /** Highlights this card (the journey shown in the side panel). */
  selectedId: string | null;
  header: ReactNode;
  empty: ReactElement;
  margin: number;
  paddingBottom: number;
  onPressJourney: (journey: JourneyListItem) => void;
}

/** Tablet layout: equal-width cards in a grid, no section headers. */
export const JourneyGrid = ({
  journeys,
  columns,
  selectedId,
  header,
  empty,
  margin,
  paddingBottom,
  onPressJourney,
}: JourneyGridProps): ReactNode => {
  const half = GRID_GAP / 2;

  return (
    <FlashList
      // A new column count needs a fresh list.
      key={columns}
      data={journeys}
      numColumns={columns}
      renderItem={({ item }) => (
        <View style={{ padding: half }}>
          <JourneyItem
            journey={item}
            layout="hero"
            selected={item.id === selectedId}
            onPress={onPressJourney}
          />
        </View>
      )}
      keyExtractor={(item) => item.id}
      // The cards' own half gap makes up the rest of the margin.
      ListHeaderComponent={<View style={{ paddingHorizontal: half }}>{header}</View>}
      ListEmptyComponent={empty}
      contentContainerStyle={{ paddingHorizontal: margin - half, paddingBottom }}
      showsVerticalScrollIndicator={false}
    />
  );
};
