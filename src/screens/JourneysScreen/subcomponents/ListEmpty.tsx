import type { ReactNode } from 'react';
import { EmptyState } from '@/components/feedback';
import { ListSkeleton } from './ListSkeleton';

interface ListEmptyProps {
  isLoading: boolean;
  isError: boolean;
  /** Journeys exist, so an empty list means the filter matches none. */
  hasJourneys: boolean;
  onRetry: () => void;
  onStart: () => void;
  onShowAll: () => void;
}

/** What the list shows instead of cards: loading, a load error, no journeys at all, or no match. */
export const ListEmpty = ({
  isLoading,
  isError,
  hasJourneys,
  onRetry,
  onStart,
  onShowAll,
}: ListEmptyProps): ReactNode => {
  if (isLoading) return <ListSkeleton />;
  if (isError) {
    return (
      <EmptyState
        title="Couldn't load your journeys"
        message="Something went wrong reading them from this device."
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }
  if (!hasJourneys) {
    return (
      <EmptyState
        title="No journeys yet"
        message="Your map is waiting. Start one and your trips line up here, newest first."
        actionLabel="Start a journey"
        onAction={onStart}
      />
    );
  }
  return (
    <EmptyState
      title="Nothing here yet"
      message="No journey matches this filter."
      actionLabel="Show all journeys"
      onAction={onShowAll}
    />
  );
};
