import { FlashList } from '@shopify/flash-list';
import type { ReactElement, ReactNode } from 'react';
import { View } from 'react-native';
import type { JourneyListItem } from '@/api/journeys.api';
import { space } from '@/theme/layout';
import type { JourneyListRow } from '@/utils/journey.util';
import { JourneyItem } from './JourneyItem';
import { SectionHeader } from './SectionHeader';

interface JourneyRowsProps {
  rows: JourneyListRow<JourneyListItem>[];
  /** Title and filter chips; scrolls with the list. */
  header: ReactNode;
  /** Shown instead of rows while loading, on an error, or when nothing matches. */
  empty: ReactElement;
  /** Left and right space, applied as list padding so the list itself spans the whole width. */
  margin: number;
  paddingBottom: number;
  onPressJourney: (journey: JourneyListItem) => void;
}

/** Phone layout: the ongoing journey as a hero, then compact rows under a header per year. */
export const JourneyRows = ({
  rows,
  header,
  empty,
  margin,
  paddingBottom,
  onPressJourney,
}: JourneyRowsProps): ReactNode => (
  <FlashList
    data={rows}
    renderItem={({ item }) => {
      if (item.kind === 'header') return <SectionHeader label={item.label} count={item.count} />;
      return (
        // Cards have no gap prop inside a list, so every row carries its own bottom space.
        <View style={{ paddingBottom: space[3] }}>
          <JourneyItem journey={item.journey} layout={item.kind} onPress={onPressJourney} />
        </View>
      );
    }}
    keyExtractor={(item) => item.key}
    getItemType={(item) => item.kind}
    ListHeaderComponent={<>{header}</>}
    ListEmptyComponent={empty}
    contentContainerStyle={{ paddingHorizontal: margin, paddingBottom }}
    showsVerticalScrollIndicator={false}
  />
);
