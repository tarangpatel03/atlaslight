import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import type { StopDetail } from '@/api/stops.api';
import { AppText } from '@/components/brand';
import { AppButton, IconButton } from '@/components/buttons';
import { Chip } from '@/components/inputs';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { formatDate, formatTime } from '@/utils/format.util';
import { MediaGrid } from './MediaGrid';
import { MediaPager } from './MediaPager';
import { PlaceCard } from './PlaceCard';

/** Pager height as a share of its width (4:3). */
const PAGER_RATIO = 0.75;

interface MemoryDetailBodyProps {
  stop: StopDetail;
  /** Name of the memory's journey, shown above the title. */
  journeyTitle: string | undefined;
  /** In the side panel (close icon, smaller title) instead of a full phone screen (back icon). */
  panel: boolean;
  gutter: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const moodLabel = (mood: string): string => mood.charAt(0).toUpperCase() + mood.slice(1);

/** Everything about one memory: pager, when, place, mood, note, thumbnails and the Edit / Delete actions. */
export const MemoryDetailBody = ({
  stop,
  journeyTitle,
  panel,
  gutter,
  onClose,
  onEdit,
  onDelete,
}: MemoryDetailBodyProps): ReactNode => {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const onLayout = (event: LayoutChangeEvent): void => setWidth(event.nativeEvent.layout.width);
  // A removed photo can leave the index past the end.
  const page = Math.min(index, Math.max(stop.media.length - 1, 0));

  return (
    <ScrollView
      onLayout={onLayout}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <IconButton icon={panel ? 'close' : 'chevronLeft'} onPress={onClose} />
        <IconButton icon="edit" onPress={onEdit} />
      </View>

      {width > 0 ? (
        <MediaPager
          items={stop.media}
          width={width}
          height={Math.round(width * PAGER_RATIO)}
          index={page}
          onIndexChange={setIndex}
        />
      ) : null}

      <View style={[styles.facts, { paddingHorizontal: gutter }]}>
        {journeyTitle ? (
          <AppText variant="overline" color={colors.inkMuted}>
            {journeyTitle}
          </AppText>
        ) : null}
        <AppText variant={panel ? 'title' : 'display'}>{stop.title}</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          {formatDate(stop.visitedAt)} · {formatTime(stop.visitedAt)}
        </AppText>
        {stop.mood ? (
          <View style={styles.mood}>
            <Chip label={moodLabel(stop.mood)} />
          </View>
        ) : null}
        {stop.note ? <AppText variant="body">{stop.note}</AppText> : null}
      </View>

      <View style={{ paddingHorizontal: gutter }}>
        <PlaceCard place={stop.place} latitude={stop.latitude} longitude={stop.longitude} />
      </View>

      {stop.media.length > 1 ? (
        <View style={{ paddingHorizontal: gutter }}>
          <MediaGrid
            items={stop.media}
            width={Math.max(width - gutter * 2, 0)}
            index={page}
            onSelect={setIndex}
          />
        </View>
      ) : null}

      <View style={{ paddingHorizontal: gutter }}>
        <AppButton label="Delete memory" variant="danger" onPress={onDelete} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { gap: space[5], paddingTop: space[3], paddingBottom: space[8] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  facts: { gap: space[2] },
  mood: { alignSelf: 'flex-start' },
});
