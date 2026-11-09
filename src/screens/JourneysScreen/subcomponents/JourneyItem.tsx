import type { ReactNode } from 'react';
import type { JourneyListItem } from '@/api/journeys.api';
import { JourneyCard } from '@/components/cards';
import { mediaUri } from '@/services/mediaStorage.service';
import { useAppSelector } from '@/store/hooks';
import { selectUnits } from '@/store/slices';
import { formatDateRange } from '@/utils/format.util';
import { formatDistance } from '@/utils/geo.util';

interface JourneyItemProps {
  journey: JourneyListItem;
  /** `hero` for the big card (ongoing journey, grid); `row` for the compact list row. */
  layout: 'hero' | 'row';
  selected?: boolean;
  onPress: (journey: JourneyListItem) => void;
}

/** One journey as a card: maps the list data to the card's ready-made text. */
export const JourneyItem = ({
  journey,
  layout,
  selected = false,
  onPress,
}: JourneyItemProps): ReactNode => {
  const units = useAppSelector(selectUnits);
  const uri = mediaUri(journey.coverThumbnailPath);

  return (
    <JourneyCard
      layout={layout}
      selected={selected}
      title={journey.title}
      dateRange={formatDateRange(journey.startDate, journey.endDate)}
      region={journey.region}
      memoryCount={journey.stopCount}
      photoCount={journey.photoCount}
      distance={formatDistance(journey.distanceKm, units)}
      cover={uri ? { uri } : undefined}
      ongoing={journey.endDate === null}
      favorite={journey.isFavorite}
      onPress={() => onPress(journey)}
    />
  );
};
