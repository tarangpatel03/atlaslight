import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { JourneyDetail } from '@/api/journeys.api';
import { AppText, Icon } from '@/components/brand';
import { StatTile } from '@/components/surfaces';
import type { DistanceUnit } from '@/store/slices';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { kmToMiles } from '@/utils/geo.util';
import { tripDays } from '@/utils/journey.util';

const MAP_SLOT_HEIGHT = 200;

interface JourneyBodyProps {
  journey: JourneyDetail;
  units: DistanceUnit;
  gutter: number;
}

/** The four numbers, the description when there is one, and the place the route map will go. */
export const JourneyBody = ({ journey, units, gutter }: JourneyBodyProps): ReactNode => {
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
      {/* Reserved for the route map and Replay route (Phase 4). */}
      <View style={styles.mapSlot}>
        <Icon name="route" color={colors.inkSubtle} />
        <AppText variant="caption" color={colors.inkMuted} style={styles.mapText}>
          Your route map and Replay route arrive with the map.
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  body: { gap: space[4], paddingTop: space[4] },
  // Always two rows of two: the tiles share the width evenly on every window size.
  stats: { gap: space[3] },
  statsRow: { flexDirection: 'row', gap: space[3] },
  mapSlot: {
    height: MAP_SLOT_HEIGHT,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    padding: space[6],
  },
  mapText: { textAlign: 'center' },
});
