import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { JourneyDetail } from '@/api/journeys.api';
import { AppText, Icon } from '@/components/brand';
import { IconButton } from '@/components/buttons';
import { Cover } from '@/components/cards';
import { mediaUri } from '@/services/mediaStorage.service';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { formatDateRange } from '@/utils/format.util';
import { tripDays } from '@/utils/journey.util';

interface DetailHeroProps {
  journey: JourneyDetail;
  /** Cover height; taller on phones where it is the first thing on screen. */
  height: number;
  /** Space left and right of the title and buttons. */
  gutter: number;
  onBack: () => void;
  onEdit: () => void;
}

/** Cover with the journey's dates and title on the scrim, and back and edit buttons on top. */
export const DetailHero = ({
  journey,
  height,
  gutter,
  onBack,
  onEdit,
}: DetailHeroProps): ReactNode => {
  const ongoing = journey.endDate === null;
  const cover = mediaUri(journey.coverThumbnailPath);

  return (
    <View style={{ height }}>
      <Cover source={cover ? { uri: cover } : undefined} scrim style={styles.cover} />
      <View style={[styles.buttons, { paddingHorizontal: gutter }]}>
        <IconButton icon="chevronLeft" onPress={onBack} />
        <View style={styles.right}>
          {journey.isFavorite ? (
            <View style={styles.heart}>
              <Icon name="heart" color={colors.amber} />
            </View>
          ) : null}
          <IconButton icon="edit" onPress={onEdit} />
        </View>
      </View>
      <View style={[styles.text, { paddingHorizontal: gutter }]} pointerEvents="none">
        <AppText variant="overline" color={ongoing ? colors.auroraTeal : colors.inkMuted}>
          {ongoing
            ? `Ongoing · Day ${tripDays(journey.startDate, null)}`
            : formatDateRange(journey.startDate, journey.endDate)}
        </AppText>
        <AppText variant="display" numberOfLines={2}>
          {journey.title}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cover: { ...StyleSheet.absoluteFill },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: space[3],
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  heart: { padding: space[3], borderRadius: radius.pill, backgroundColor: colors.glassFallback },
  text: { position: 'absolute', left: 0, right: 0, bottom: space[4], gap: space[1] },
});
