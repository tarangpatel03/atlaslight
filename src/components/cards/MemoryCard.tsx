import type { ReactNode } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { Chip } from '@/components/inputs';
import { Card } from '@/components/surfaces';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { formatCount } from '@/utils/format.util';
import { Cover } from './Cover';

interface MemoryCardProps {
  /** Position in the journey's route, starting at 1. */
  step: number;
  title: string;
  place?: string;
  /** Ready-made text, e.g. `13 Mar 2026`. */
  visitedLabel: string;
  mediaCount: number;
  thumb?: ImageSourcePropType;
  /** Display text, e.g. "Calm". */
  mood?: string;
  /** Last row of the timeline: no connector line below the dot. */
  isLast?: boolean;
  onPress: () => void;
  /** Long press, e.g. to drag the row in a reorderable timeline. */
  onLongPress?: () => void;
}

const THUMB = 64;
const DOT = 24;

/** Timeline row for one memory: step number on an amber dot, joined to the next row by a line. */
export const MemoryCard = ({
  step,
  title,
  place,
  visitedLabel,
  mediaCount,
  thumb,
  mood,
  isLast = false,
  onPress,
  onLongPress,
}: MemoryCardProps): ReactNode => {
  const photos = formatCount(mediaCount, 'photo', 'photos');

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={styles.dot}>
          <AppText variant="coord" color={colors.onAmber}>
            {step}
          </AppText>
        </View>
        {isLast ? null : <View style={styles.line} />}
      </View>
      <View style={[styles.body, !isLast && styles.bodySpacing]}>
        <Card onPress={onPress} onLongPress={onLongPress} style={styles.card}>
          <View style={styles.cardRow}>
            <Cover source={thumb} style={styles.thumb} />
            <View style={styles.text}>
              <AppText variant="title" numberOfLines={2}>
                {title}
              </AppText>
              {place ? (
                <View style={styles.meta}>
                  <Icon name="mapPin" size={18} color={colors.inkMuted} />
                  <AppText
                    variant="caption"
                    color={colors.inkMuted}
                    numberOfLines={1}
                    style={styles.shrink}
                  >
                    {place}
                  </AppText>
                </View>
              ) : null}
              <View style={styles.meta}>
                <Icon name="image" size={18} color={colors.inkMuted} />
                <AppText variant="caption" color={colors.inkMuted} style={styles.shrink}>
                  {visitedLabel} · {photos}
                </AppText>
              </View>
              {mood ? (
                <View style={styles.chip}>
                  <Chip label={mood} />
                </View>
              ) : null}
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space[3] },
  rail: { width: DOT, alignItems: 'center' },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space[4],
  },
  // Stretches to the bottom of the row so it meets the next row's dot.
  line: { flex: 1, width: 2, marginTop: space[1], backgroundColor: colors.hairline },
  body: { flex: 1 },
  bodySpacing: { paddingBottom: space[3] },
  card: { padding: space[3] },
  cardRow: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  thumb: { width: THUMB, height: THUMB, borderRadius: radius.sm },
  // Texts fill the column: a shrink-wrapped title can lose its last word to a rounding difference on Android.
  text: { flex: 1, gap: space[1] },
  chip: { alignSelf: 'flex-start' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  shrink: { flexShrink: 1 },
});
