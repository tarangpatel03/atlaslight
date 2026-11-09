import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { JourneyMediaItem } from '@/api/journeys.api';
import { AppText, Icon } from '@/components/brand';
import { Cover } from '@/components/cards';
import { mediaUri } from '@/services/mediaStorage.service';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';

const TILE = 72;

interface CoverPickerProps {
  items: JourneyMediaItem[];
  /** The chosen cover's media id; null = the journey picks its own (first photo of the first memory). */
  selectedId: string | null;
  onSelect: (mediaId: string | null) => void;
  /** Space left and right the strip scrolls through, so it can run to the edge of the form. */
  gutter: number;
}

/** Horizontal strip of the journey's photos, with an "Automatic" tile first. */
export const CoverPicker = ({
  items,
  selectedId,
  onSelect,
  gutter,
}: CoverPickerProps): ReactNode => (
  <View style={styles.wrap}>
    <AppText variant="label" style={{ paddingHorizontal: gutter }}>
      Cover
    </AppText>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.strip, { paddingHorizontal: gutter }]}
    >
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.tile, selectedId === null && styles.selected]}
      >
        <View style={styles.auto}>
          <Icon name="image" color={colors.inkMuted} />
          <AppText variant="label" color={colors.inkMuted}>
            Automatic
          </AppText>
        </View>
      </Pressable>
      {items.map((item) => {
        const uri = mediaUri(item.thumbnailPath);
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[styles.tile, selectedId === item.id && styles.selected]}
          >
            <Cover source={uri ? { uri } : undefined} style={styles.cover} />
          </Pressable>
        );
      })}
    </ScrollView>
    {items.length === 0 ? (
      <AppText variant="caption" color={colors.inkMuted} style={{ paddingHorizontal: gutter }}>
        Add photos to a memory to choose a cover.
      </AppText>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: space[2] },
  strip: { gap: space[2] },
  // The border is always there (transparent) so selecting a tile does not shift the strip.
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
  },
  selected: { borderColor: colors.amber },
  auto: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[1] },
  cover: { width: '100%', height: '100%' },
});
