import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { JourneyDetail } from '@/api/journeys.api';
import type { StopListItem } from '@/api/stops.api';
import { AppText } from '@/components/brand';
import { JourneyRouteMap } from '@/components/map';
import { StatTile } from '@/components/surfaces';
import type { DistanceUnit } from '@/store/slices';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { kmToMiles } from '@/utils/geo.util';
import { tripDays } from '@/utils/journey.util';

interface JourneyBodyProps {
  journey: JourneyDetail;
  units: DistanceUnit;
  gutter: number;
  stops: StopListItem[];
  mapHeight: number;
  onOpenMemory: (stopId: string) => void;
}

/** The four numbers, the description when there is one, and the route map. */
export const JourneyBody = ({
  journey,
  units,
  gutter,
  stops,
  mapHeight,
  onOpenMemory,
}: JourneyBodyProps): ReactNode => {
  const distance = units === 'mi' ? kmToMiles(journey.distanceKm) : journey.distanceKm;

  return (
    <View style={[styles.body, { paddingHorizontal: gutter }]}>
      <View style={styles.stats}>
        <View style={styles.statsRow}>
          <StatTile value={journey.stopCount} label="Memories" />
          <StatTile value={journey.photoCount} label="Photos" />
        </View>
        <View style={styles.statsRow}>
          <StatTile value={Math.round(distance)} label={units === 'mi' ? 'Miles' : 'Km'} />
          <StatTile value={tripDays(journey.startDate, journey.endDate)} label="Days" />
        </View>
      </View>
      {journey.description ? (
        <AppText variant="body" color={colors.inkMuted}>
          {journey.description}
        </AppText>
      ) : null}
      <JourneyRouteMap
        stops={stops}
        color={journey.color}
        height={mapHeight}
        onOpenMemory={onOpenMemory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  body: { gap: space[4], paddingTop: space[4] },
  // Always two rows of two: the tiles share the width evenly on every window size.
  stats: { gap: space[3] },
  statsRow: { flexDirection: 'row', gap: space[3] },
});
