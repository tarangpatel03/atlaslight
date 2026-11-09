import type { ReactNode } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { Chip } from '@/components/inputs';
import { Card } from '@/components/surfaces';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { formatCount } from '@/utils/format.util';
import { Cover } from './Cover';

interface JourneyCardProps {
  title: string;
  /** Ready-made text, e.g. `12–15 Mar 2026` (see `formatDateRange`). */
  dateRange: string;
  memoryCount: number;
  /** Photos in the journey; left out of the meta line when not given. */
  photoCount?: number;
  /** Ready-made text, e.g. `1,240 km` (see `formatDistance`); left out when not given. */
  distance?: string;
  /** State or province, shown after the dates. */
  region?: string | null;
  cover?: ImageSourcePropType;
  /** Journey without an end date: shows the live "Ongoing" chip. */
  ongoing?: boolean;
  favorite?: boolean;
  /** Highlights the card (the journey shown in the tablet side panel). */
  selected?: boolean;
  /** `hero` is the big card (ongoing journey, tablet grid); `row` is the compact list row. */
  layout: 'hero' | 'row';
  onPress: () => void;
}

const THUMB = 88;

/** Journey in a list or grid: cover, title, dates and memory count. */
export const JourneyCard = ({
  title,
  dateRange,
  memoryCount,
  photoCount,
  distance,
  region,
  cover,
  ongoing = false,
  favorite = false,
  selected = false,
  layout,
  onPress,
}: JourneyCardProps): ReactNode => {
  const dates = region ? `${dateRange} · ${region}` : dateRange;
  const meta = [
    formatCount(memoryCount, 'memory', 'memories'),
    photoCount === undefined ? null : formatCount(photoCount, 'photo', 'photos'),
    distance ?? null,
  ]
    .filter((part): part is string => part !== null)
    .join(' · ');
  const frame = [layout === 'hero' ? styles.heroCard : styles.rowCard, selected && styles.selected];

  if (layout === 'hero') {
    return (
      <Card onPress={onPress} style={frame}>
        <Cover source={cover} scrim style={styles.heroCover} />
        <View style={styles.heroOverlay} pointerEvents="none">
          <AppText variant="title" numberOfLines={2}>
            {title}
          </AppText>
        </View>
        {ongoing ? (
          // On the photo like the design; the scrim behind keeps the label readable on any picture.
          <View style={styles.heroBadge}>
            <Chip label="Ongoing" variant="live" />
          </View>
        ) : null}
        {favorite ? (
          <View style={styles.heroHeart}>
            <Icon name="heart" color={colors.amber} />
          </View>
        ) : null}
        <View style={styles.heroMeta}>
          <View style={styles.metaText}>
            <AppText variant="caption" color={colors.inkMuted}>
              {dates}
            </AppText>
            <AppText variant="coord" color={colors.inkSubtle}>
              {meta}
            </AppText>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} style={frame}>
      <View style={styles.row}>
        <Cover source={cover} style={styles.thumb} />
        <View style={styles.rowText}>
          <AppText variant="subheading" numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            {dates}
          </AppText>
          <AppText variant="coord" color={colors.inkSubtle}>
            {meta}
          </AppText>
          {ongoing ? <Chip label="Ongoing" variant="live" /> : null}
        </View>
        {favorite ? <Icon name="heart" size={18} color={colors.amber} /> : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // The border is always there (transparent) so selecting a card does not shift its content.
  heroCard: { padding: 0, overflow: 'hidden', borderWidth: 1.5, borderColor: 'transparent' },
  rowCard: { padding: space[3], borderWidth: 1.5, borderColor: 'transparent' },
  selected: { backgroundColor: colors.surfaceOverlay, borderColor: colors.amber },
  heroCover: { width: '100%', aspectRatio: 16 / 9 },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Title sits on the scrim at the bottom of the 16:9 cover.
    aspectRatio: 16 / 9,
    justifyContent: 'flex-end',
    padding: space[4],
  },
  heroBadge: {
    position: 'absolute',
    top: space[3],
    left: space[3],
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
  heroHeart: {
    position: 'absolute',
    top: space[3],
    right: space[3],
    padding: space[2],
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    padding: space[4],
  },
  metaText: { flexShrink: 1, gap: space[1] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  thumb: { width: THUMB, height: THUMB, borderRadius: radius.sm },
  rowText: { flex: 1, gap: space[1], alignItems: 'flex-start' },
});
