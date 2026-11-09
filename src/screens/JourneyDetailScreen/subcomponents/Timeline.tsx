import type { ReactElement, ReactNode } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import ReorderableList, {
  reorderItems,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';
import type { StopListItem } from '@/api/stops.api';
import { TimelineItem } from './TimelineItem';

interface TimelineProps {
  stops: StopListItem[];
  /** Drawn above the first memory and scrolls with the list. */
  header: ReactElement;
  empty: ReactElement;
  paddingBottom: number;
  gutter: number;
  /** Called with the memory ids in their new order after a drop. */
  onReorder: (orderedIds: string[]) => void;
  onOpenMemory: (stop: StopListItem) => void;
}

/** The journey's memories in route order; long-press and drag to change the route. */
export const Timeline = ({
  stops,
  header,
  empty,
  paddingBottom,
  gutter,
  onReorder,
  onOpenMemory,
}: TimelineProps): ReactNode => {
  const handleReorder = ({ from, to }: ReorderableListReorderEvent): void =>
    onReorder(reorderItems(stops, from, to).map((stop) => stop.id));

  const renderItem = ({ item, index }: ListRenderItemInfo<StopListItem>): ReactElement => (
    <TimelineItem
      stop={item}
      step={index + 1}
      isLast={index === stops.length - 1}
      onPress={() => onOpenMemory(item)}
    />
  );

  return (
    <ReorderableList
      data={stops}
      keyExtractor={(stop) => stop.id}
      renderItem={renderItem}
      onReorder={handleReorder}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom }}
    />
  );
};
