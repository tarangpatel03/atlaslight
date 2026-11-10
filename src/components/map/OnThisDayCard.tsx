import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { Cover } from '@/components/cards';
import { mediaUri } from '@/services/mediaStorage.service';
import { colors } from '@/theme/colors';
import { radius, shadows, space } from '@/theme/layout';
import { formatRelativeDay } from '@/utils/format.util';

interface OnThisDayCardProps {
  title: string;
  journeyTitle: string;
  /** When the memory happened (ms); the card says how long ago. */
  visitedAt: number;
  /** Relative path of the memory's cover thumbnail, if it has one. */
  coverThumbnailPath: string | null;
  onPress: () => void;
  onClose: () => void;
}

const COVER = 56;

/** Glass card over the map: a memory from this day in an earlier year. Tapping it opens the memory on the map. */
export const OnThisDayCard = ({
  title,
  journeyTitle,
  visitedAt,
  coverThumbnailPath,
  onPress,
  onClose,
}: OnThisDayCardProps): ReactNode => {
  const cover = mediaUri(coverThumbnailPath);

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.main}>
        <Cover source={cover ? { uri: cover } : undefined} style={styles.cover} />
        <View style={styles.text}>
          <AppText variant="overline" color={colors.amber} numberOfLines={1}>
            On this day · {formatRelativeDay(visitedAt)}
          </AppText>
          <AppText variant="subheading" numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
            {journeyTitle}
          </AppText>
        </View>
      </Pressable>
      <Pressable onPress={onClose} hitSlop={space[2]} style={styles.close}>
        <Icon name="close" size={18} color={colors.inkMuted} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space[3],
    gap: space[2],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.glassFallback,
    ...shadows.float,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[3] },
  cover: { width: COVER, height: COVER, borderRadius: radius.md },
  text: { flex: 1, gap: space[1] },
  close: { alignSelf: 'flex-start' },
});
