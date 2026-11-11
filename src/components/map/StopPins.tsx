import type { ReactNode, Ref } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import {
  GeoJSONSource,
  Layer,
  Marker,
  type GeoJSONSourceRef,
  type PressEventWithFeatures,
} from '@maplibre/maplibre-react-native';
import type { FeatureCollection, Point } from 'geojson';
import { mediaUri } from '@/services/mediaStorage.service';
import { mapPinPaint, mapPins } from '@/theme/mapPins';
import type { MapStopItem } from '@/api/map.api';
import type { PinProps } from '@/utils/mapFeatures.util';
import { MapPin } from './MapPin';

/** Layer ids other code queries (the viewport query reads the dots). */
export const STOP_LAYERS = {
  clusters: 'stop-clusters',
  clusterCount: 'stop-cluster-count',
  dots: 'stop-dots',
  selected: 'stop-selected',
} as const;

const SOURCE_ID = 'stops';
const COUNT_FONT = ['Noto Sans Bold']; // a font the OpenFreeMap glyph server has (see mapStyle.ts)

interface StopPinsProps {
  points: FeatureCollection<Point, PinProps>;
  /** Memories to draw as photo pins (the ones in view; chosen by useMapPins). */
  photoStops: MapStopItem[];
  selectedId: string | null;
  sourceRef: Ref<GeoJSONSourceRef>;
  onPressStop: (stopId: string) => void;
  onPressCluster: (clusterId: number, lngLat: [number, number]) => void;
}

/**
 * Memories on the map: one clustered source drawn by native layers (amber dots, count clusters,
 * a ring on the selected one), plus photo pins as React views for the few in view when zoomed in.
 */
export const StopPins = ({
  points,
  photoStops,
  selectedId,
  sourceRef,
  onPressStop,
  onPressCluster,
}: StopPinsProps): ReactNode => {
  const handlePress = (event: NativeSyntheticEvent<PressEventWithFeatures>): void => {
    const feature = event.nativeEvent.features[0];
    if (!feature) return;
    // Handled here, so the map's own press (which clears the selection) must not also fire.
    event.stopPropagation();
    const { cluster_id: clusterId, id } = feature.properties ?? {};
    if (typeof clusterId === 'number') {
      // Fly to the cluster's own centre: the press point can lie far from it (a tap on the edge of a big
      // cluster flew to a street-level view of the wrong city).
      if (feature.geometry.type === 'Point') {
        const [longitude, latitude] = feature.geometry.coordinates;
        onPressCluster(clusterId, [longitude, latitude]);
      } else {
        onPressCluster(clusterId, event.nativeEvent.lngLat);
      }
    } else if (typeof id === 'string') {
      onPressStop(id);
    }
  };

  return (
    <>
      <GeoJSONSource
        id={SOURCE_ID}
        ref={sourceRef}
        data={points}
        cluster
        clusterRadius={mapPins.clusterPixelRadius}
        clusterMaxZoom={mapPins.clusterMaxZoom}
        onPress={handlePress}
      >
        <Layer
          type="circle"
          id={STOP_LAYERS.clusters}
          filter={['has', 'point_count']}
          paint={mapPinPaint.cluster}
        />
        <Layer
          type="symbol"
          id={STOP_LAYERS.clusterCount}
          filter={['has', 'point_count']}
          layout={{
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': COUNT_FONT,
            'text-size': 13,
            'text-allow-overlap': true,
          }}
          paint={mapPinPaint.clusterCount}
        />
        <Layer
          type="circle"
          id={STOP_LAYERS.dots}
          filter={['!', ['has', 'point_count']]}
          paint={mapPinPaint.dot}
        />
        <Layer
          type="circle"
          id={STOP_LAYERS.selected}
          filter={['==', ['get', 'id'], selectedId ?? '']}
          paint={mapPinPaint.selected}
        />
      </GeoJSONSource>

      {photoStops.map((stop) => (
        <Marker
          key={stop.id}
          id={`photo-${stop.id}`}
          lngLat={[stop.longitude, stop.latitude]}
          onPress={(event) => {
            event.stopPropagation();
            onPressStop(stop.id);
          }}
        >
          <MapPin
            variant="photo"
            uri={mediaUri(stop.coverThumbnailPath)}
            selected={stop.id === selectedId}
            drop
          />
        </Marker>
      ))}
    </>
  );
};
