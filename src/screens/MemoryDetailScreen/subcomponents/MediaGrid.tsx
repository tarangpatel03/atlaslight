import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from '@/components/brand';
import { Cover } from '@/components/cards';
import type { Media } from '@/db/schema';
import { mediaUri } from '@/services/mediaStorage.service';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';

const COLUMNS = 3;

interface MediaGridProps {
  items: Media[];
  /** Width the grid fills; tiles split it into three columns. */
  width: number;
  /** The page showing in the pager; its tile gets the amber outline. */
  index: number;
  onSelect: (index: number) => void;
}

/** Thumbnails of the memory's photos and videos; a tap shows that one in the pager. */
export const MediaGrid = ({ items, width, index, onSelect }: MediaGridProps): ReactNode => {
  const tile = (width - space[2] * (COLUMNS - 1)) / COLUMNS;

  return (
    <View style={styles.grid}>
      {items.map((item, position) => {
        const uri = mediaUri(item.thumbnailPath);
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(position)}
            style={[
              styles.tile,
              { width: tile, height: tile },
              position === index && styles.active,
            ]}
          >
            <Cover source={uri ? { uri } : undefined} style={styles.cover} />
            {item.type === 'video' ? (
              <View style={styles.badge}>
                <Icon name="video" size={18} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  // The border is always there (transparent) so selecting a tile does not shift the grid.
  tile: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  active: { borderColor: colors.amber },
  cover: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    left: space[1],
    bottom: space[1],
    padding: space[1],
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
});
