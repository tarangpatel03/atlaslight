import { memo, type ReactNode } from 'react';
import { useReorderableDrag } from 'react-native-reorderable-list';
import type { StopListItem } from '@/api/stops.api';
import { MemoryCard } from '@/components/cards';
import { mediaUri } from '@/services/mediaStorage.service';
import { formatDate } from '@/utils/format.util';

interface TimelineItemProps {
  stop: StopListItem;
  /** Position in the route, starting at 1. */
  step: number;
  isLast: boolean;
  onPress: () => void;
}

const moodLabel = (mood: string): string => mood.charAt(0).toUpperCase() + mood.slice(1);

/** One memory in the timeline; a long press picks it up to reorder the route. */
export const TimelineItem = memo(
  ({ stop, step, isLast, onPress }: TimelineItemProps): ReactNode => {
    const drag = useReorderableDrag();
    const thumb = mediaUri(stop.coverThumbnailPath);

    return (
      <MemoryCard
        step={step}
        title={stop.title}
        place={stop.placeName ?? undefined}
        visitedLabel={formatDate(stop.visitedAt)}
        mediaCount={stop.mediaCount}
        thumb={thumb ? { uri: thumb } : undefined}
        mood={stop.mood ? moodLabel(stop.mood) : undefined}
        isLast={isLast}
        onPress={onPress}
        onLongPress={drag}
      />
    );
  },
);
