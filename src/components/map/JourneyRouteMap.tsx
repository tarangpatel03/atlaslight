import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GeoJSONSource,
  Layer,
  Marker,
  type PressEventWithFeatures,
} from '@maplibre/maplibre-react-native';
import type { NativeSyntheticEvent } from 'react-native';
import type { StopListItem } from '@/api/stops.api';
import { AppText, Icon } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { useRouteReplay } from '@/hooks/useRouteReplay';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { mapPinPaint } from '@/theme/mapPins';
import { routeLayout, routeLinePaint } from '@/theme/mapStyle';
import { journeyRoutes, stopsBounds, stopsToPoints, type MapStop } from '@/utils/mapFeatures.util';
import { AtlasMap } from './AtlasMap';
import { MapPin } from './MapPin';
import { RouteLines } from './RouteLines';

interface JourneyRouteMapProps {
  stops: StopListItem[];
  /** The journey's accent colour. */
  color: string;
  height: number;
  onOpenMemory: (stopId: string) => void;
}

/**
 * One journey on the dark map: the aurora route, a dot per memory (tap opens it) and Replay
 * route, which draws the line again with a pulse riding its head.
 */
export const JourneyRouteMap = ({
  stops,
  color,
  height,
  onOpenMemory,
}: JourneyRouteMapProps): ReactNode => {
  const mapStops = useMemo<MapStop[]>(
    () => stops.map((stop) => ({ ...stop, color })),
    [stops, color],
  );
  const points = useMemo(() => stopsToPoints(mapStops), [mapStops]);
  const routes = useMemo(() => journeyRoutes(mapStops), [mapStops]);
  const bounds = useMemo(() => stopsBounds(mapStops), [mapStops]);
  const coordinates = routes.features[0]?.geometry.coordinates ?? [];
  const { replaying, slice, start } = useRouteReplay(coordinates);

  if (!bounds) {
    return (
      <View style={[styles.frame, styles.empty, { height }]}>
        <Icon name="route" color={colors.inkSubtle} />
        <AppText variant="caption" color={colors.inkMuted} style={styles.emptyText}>
          Add a memory to see your route.
        </AppText>
      </View>
    );
  }

  const handlePress = (event: NativeSyntheticEvent<PressEventWithFeatures>): void => {
    const id = event.nativeEvent.features[0]?.properties?.id;
    if (typeof id === 'string') {
      event.stopPropagation();
      onOpenMemory(id);
    }
  };

  return (
    <View style={[styles.frame, { height }]}>
      {/* Frozen: the map sits inside a scrolling page and must never steal the scroll. Remount when the memories move, so the opening frame always fits them. */}
      <AtlasMap key={bounds.join(',')} initialBounds={bounds} interactive={false}>
        {replaying ? null : <RouteLines routes={routes} />}
        {slice ? (
          <GeoJSONSource
            id="route-replay"
            lineMetrics
            data={{
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: slice.line },
            }}
          >
            <Layer type="line" id="route-replay-line" layout={routeLayout} paint={routeLinePaint} />
          </GeoJSONSource>
        ) : null}
        <GeoJSONSource id="journey-stops" data={points} onPress={handlePress}>
          <Layer type="circle" id="journey-stop-dots" paint={mapPinPaint.dot} />
        </GeoJSONSource>
        {slice ? (
          <Marker id="route-head" lngLat={[slice.head[0], slice.head[1]]}>
            <MapPin variant="live" />
          </Marker>
        ) : null}
      </AtlasMap>
      {coordinates.length > 1 ? (
        <View style={styles.replay}>
          <AppButton
            label={replaying ? 'Replaying…' : 'Replay route'}
            variant="secondary"
            icon="route"
            disabled={replaying}
            onPress={start}
          />
        </View>
      ) : null}
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
  empty: { alignItems: 'center', justifyContent: 'center', gap: space[2], padding: space[6] },
  emptyText: { textAlign: 'center' },
  // Solid behind the outline button, so map labels never show through it.
  replay: {
    position: 'absolute',
    right: space[3],
    bottom: space[3],
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
});
