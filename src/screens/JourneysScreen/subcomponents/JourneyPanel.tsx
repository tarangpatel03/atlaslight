import { useMemo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { JourneyListItem } from '@/api/journeys.api';
import { useGetStopsByJourneyQuery } from '@/api/stops.api';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { Cover } from '@/components/cards';
import { mediaUri } from '@/services/mediaStorage.service';
import { useAppSelector } from '@/store/hooks';
import { selectUnits } from '@/store/slices';
import { colors } from '@/theme/colors';
import { sizes, space } from '@/theme/layout';
import { formatDateRange } from '@/utils/format.util';
import { kmToMiles } from '@/utils/geo.util';
import { tripDays } from '@/utils/journey.util';
import { LatestMemoryRow } from './LatestMemoryRow';

const COVER_HEIGHT = 230;
const LATEST_COUNT = 3;

interface JourneyPanelProps {
  /** The selected journey; null shows a hint instead. */
  journey: JourneyListItem | null;
  onOpenJourney: (journey: JourneyListItem) => void;
  onOpenMemory: (stopId: string) => void;
}

/** Tablet side panel: cover, the journey's numbers, its newest memories and the way into the journey. */
export const JourneyPanel = ({
  journey,
  onOpenJourney,
  onOpenMemory,
}: JourneyPanelProps): ReactNode => {
  const units = useAppSelector(selectUnits);
  const { data: stops } = useGetStopsByJourneyQuery(journey?.id ?? '', { skip: !journey });
  const latest = useMemo(
    () => [...(stops ?? [])].sort((a, b) => b.visitedAt - a.visitedAt).slice(0, LATEST_COUNT),
    [stops],
  );

  if (!journey) {
    return (
      <View style={[styles.panel, styles.hint]}>
        <AppText variant="body" color={colors.inkMuted} style={styles.hintText}>
          Pick a journey and its numbers and latest memories show up here.
        </AppText>
      </View>
    );
  }

  const ongoing = journey.endDate === null;
  const cover = mediaUri(journey.coverThumbnailPath);
  const distance = units === 'mi' ? kmToMiles(journey.distanceKm) : journey.distanceKm;
  const stats = [
    { label: 'Stops', value: journey.stopCount },
    { label: 'Photos', value: journey.photoCount },
    { label: units === 'mi' ? 'Mi' : 'Km', value: Math.round(distance) },
    { label: 'Days', value: tripDays(journey.startDate, journey.endDate) },
  ];

  return (
    <View style={styles.panel}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Cover
            source={cover ? { uri: cover } : undefined}
            scrim
            scrimColor={colors.surface}
            style={styles.cover}
          />
          <View style={styles.coverText} pointerEvents="none">
            <AppText variant="overline" color={ongoing ? colors.auroraTeal : colors.inkMuted}>
              {ongoing
                ? `Ongoing · Day ${tripDays(journey.startDate, null)}`
                : formatDateRange(journey.startDate, journey.endDate)}
            </AppText>
            <AppText variant="title" numberOfLines={2}>
              {journey.title}
            </AppText>
          </View>
        </View>

        <View style={styles.stats}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <AppText variant="stat" numberOfLines={1} adjustsFontSizeToFit>
                {stat.value.toLocaleString('en-US')}
              </AppText>
              <AppText variant="overline" color={colors.inkMuted}>
                {stat.label}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.latest}>
          <AppText variant="overline" color={colors.inkMuted}>
            Latest memories
          </AppText>
          {latest.length === 0 ? (
            <AppText variant="caption" color={colors.inkMuted}>
              No memories yet. Add the first one from the journey.
            </AppText>
          ) : (
            latest.map((stop) => (
              <LatestMemoryRow
                key={stop.id}
                title={stop.title}
                visitedAt={stop.visitedAt}
                coverUri={mediaUri(stop.coverThumbnailPath)}
                onPress={() => onOpenMemory(stop.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton label="Open journey" onPress={() => onOpenJourney(journey)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    width: sizes.panelWidth,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.hairline,
  },
  hint: { justifyContent: 'center', padding: space[6] },
  hintText: { textAlign: 'center' },
  cover: { width: '100%', height: COVER_HEIGHT },
  coverText: {
    position: 'absolute',
    left: space[6],
    right: space[6],
    bottom: space[3],
    gap: space[1],
  },
  stats: {
    flexDirection: 'row',
    gap: space[2],
    paddingHorizontal: space[6],
    paddingTop: space[3],
  },
  stat: { flex: 1 },
  latest: {
    gap: space[3],
    paddingHorizontal: space[6],
    paddingTop: space[5],
    paddingBottom: space[4],
  },
  footer: {
    padding: space[6],
    paddingTop: space[4],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});
