import { useEffect, useRef, type ReactNode } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Video from 'react-native-video';
import type { Media } from '@/db/schema';
import { AppText, Icon } from '@/components/brand';
import { mediaUri } from '@/services/mediaStorage.service';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';

interface MediaPagerProps {
  items: Media[];
  /** Width of one page; the pager is as wide as its screen or panel. */
  width: number;
  height: number;
  /** The page showing; changing it scrolls there (a grid tile was tapped). */
  index: number;
  onIndexChange: (index: number) => void;
}

/** Swipeable photos and videos of a memory, one per page; only the page showing plays its video. */
export const MediaPager = ({
  items,
  width,
  height,
  index,
  onIndexChange,
}: MediaPagerProps): ReactNode => {
  const list = useRef<FlatList<Media>>(null);
  // The page the list itself is on, so a swipe is not scrolled to again when the index follows it.
  const shown = useRef(0);

  useEffect(() => {
    if (shown.current === index || index >= items.length) return;
    shown.current = index;
    list.current?.scrollToIndex({ index, animated: true });
  }, [index, items.length]);

  const onSettled = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    shown.current = next;
    onIndexChange(next);
  };

  const frame = { width, height };

  const renderItem = ({ item, index: page }: ListRenderItemInfo<Media>): ReactNode => {
    const uri = mediaUri(item.filePath);
    if (item.type === 'video') {
      return (
        <Video
          source={{ uri }}
          style={frame}
          resizeMode="contain"
          controls
          paused={page !== index}
          poster={mediaUri(item.thumbnailPath)}
        />
      );
    }
    return <Image source={{ uri }} style={frame} resizeMode="contain" />;
  };

  if (items.length === 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Icon name="image" color={colors.inkSubtle} />
        <AppText variant="caption" color={colors.inkMuted}>
          No photos yet. Edit to add some.
        </AppText>
      </View>
    );
  }

  return (
    <View style={{ width, height }}>
      <FlatList
        ref={list}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, page) => ({ length: width, offset: width * page, index: page })}
        onMomentumScrollEnd={onSettled}
      />
      {items.length > 1 ? (
        <View style={styles.counter} pointerEvents="none">
          <AppText variant="coord">
            {index + 1} / {items.length}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    backgroundColor: colors.surfaceOverlay,
  },
  counter: {
    position: 'absolute',
    top: space[3],
    right: space[3],
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
});
