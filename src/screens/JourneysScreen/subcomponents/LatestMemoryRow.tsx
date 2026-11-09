import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand';
import { Cover } from '@/components/cards';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { formatShortDateTime } from '@/utils/format.util';

const THUMB = 56;

interface LatestMemoryRowProps {
  title: string;
  visitedAt: number;
  /** Image URI of the memory's cover; the no-cover block shows without one. */
  coverUri?: string;
  onPress: () => void;
}

/** A memory in the side panel: small cover, title and when it happened. */
export const LatestMemoryRow = ({
  title,
  visitedAt,
  coverUri,
  onPress,
}: LatestMemoryRowProps): ReactNode => (
  <Pressable onPress={onPress} style={styles.row}>
    <Cover source={coverUri ? { uri: coverUri } : undefined} style={styles.thumb} />
    <View style={styles.text}>
      <AppText variant="bodyStrong" numberOfLines={1}>
        {title}
      </AppText>
      <AppText variant="coord" color={colors.inkSubtle}>
        {formatShortDateTime(visitedAt)}
      </AppText>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  thumb: { width: THUMB, height: THUMB, borderRadius: radius.md },
  text: { flex: 1 },
});
