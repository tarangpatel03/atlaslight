import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { Card } from '@/components/surfaces';
import type { Place } from '@/db/schema';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { formatCoordinates, placeLines } from '@/utils/memory.util';

const MAP_SLOT_HEIGHT = 140;

interface PlaceCardProps {
  place: Place | null;
  latitude: number;
  longitude: number;
}

/** Where the memory happened: place name, region, coordinates, and the spot the mini map will fill. */
export const PlaceCard = ({ place, latitude, longitude }: PlaceCardProps): ReactNode => {
  const lines = place ? placeLines(place) : null;

  return (
    <View style={styles.wrap}>
      <Card>
        <View style={styles.row}>
          <Icon name="mapPin" color={colors.amber} />
          <View style={styles.text}>
            <AppText variant="bodyStrong">{lines?.name ?? 'Pinned location'}</AppText>
            {lines?.detail ? (
              <AppText variant="caption" color={colors.inkMuted}>
                {lines.detail}
              </AppText>
            ) : null}
            <AppText variant="coord" color={colors.inkSubtle}>
              {formatCoordinates(latitude, longitude)}
            </AppText>
          </View>
        </View>
      </Card>
      {/* Reserved for the mini map (Phase 4). */}
      <View style={styles.mapSlot}>
        <Icon name="map" color={colors.inkSubtle} />
        <AppText variant="caption" color={colors.inkMuted} style={styles.mapText}>
          A map of this place arrives with the map.
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: space[3] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  text: { flex: 1, gap: space[1] },
  mapSlot: {
    height: MAP_SLOT_HEIGHT,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    padding: space[4],
  },
  mapText: { textAlign: 'center' },
});
