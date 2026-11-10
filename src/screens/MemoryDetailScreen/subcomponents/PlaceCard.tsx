import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { MiniMap } from '@/components/map';
import { Card } from '@/components/surfaces';
import type { Place } from '@/db/schema';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { formatCoordinates, placeLines } from '@/utils/memory.util';

const MAP_HEIGHT = 160;

interface PlaceCardProps {
  place: Place | null;
  latitude: number;
  longitude: number;
}

/** Where the memory happened: place name, region, coordinates and a small map of the spot. */
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
      <MiniMap latitude={latitude} longitude={longitude} height={MAP_HEIGHT} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: space[3] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  text: { flex: 1, gap: space[1] },
});
