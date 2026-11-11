import { useMemo, type ReactNode } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { WishlistEntry } from '@/api/wishlist.api';
import { mapPinPaint } from '@/theme/mapPins';

interface WishPinsProps {
  entries: WishlistEntry[];
}

/** Places to visit as violet rings, drawn by one native layer. Put it before the memory pins so those sit on top. */
export const WishPins = ({ entries }: WishPinsProps): ReactNode => {
  const points = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: entries.map((entry): Feature<Point> => ({
        type: 'Feature',
        id: entry.id,
        properties: {},
        geometry: { type: 'Point', coordinates: [entry.longitude, entry.latitude] },
      })),
    }),
    [entries],
  );

  return (
    <GeoJSONSource id="wishlist" data={points}>
      <Layer type="circle" id="wish-pins" paint={mapPinPaint.wish} />
    </GeoJSONSource>
  );
};
