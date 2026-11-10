import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/layout';
import { mapPinPaint } from '@/theme/mapPins';
import { stopsBounds } from '@/utils/mapFeatures.util';
import { AtlasMap } from './AtlasMap';

interface MiniMapProps {
  latitude: number;
  longitude: number;
  height: number;
}

/** A small fixed map of one memory's place: the dark map framed on an amber dot. */
export const MiniMap = ({ latitude, longitude, height }: MiniMapProps): ReactNode => {
  const bounds = useMemo(() => stopsBounds([{ latitude, longitude }]), [latitude, longitude]);
  const point = useMemo(
    () => ({
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'Point' as const, coordinates: [longitude, latitude] },
    }),
    [latitude, longitude],
  );
  if (!bounds) return null;

  return (
    <View style={[styles.frame, { height }]}>
      {/* Frozen so it never steals the page scroll; remounts when the place changes. */}
      <AtlasMap key={bounds.join(',')} initialBounds={bounds} interactive={false}>
        <GeoJSONSource id="mini-map-point" data={point}>
          <Layer type="circle" id="mini-map-dot" paint={mapPinPaint.dot} />
        </GeoJSONSource>
      </AtlasMap>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
});
