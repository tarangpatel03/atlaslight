import type { ReactNode } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import type { FeatureCollection, LineString } from 'geojson';
import { routeLayout, routeLinePaint } from '@/theme/mapStyle';
import type { RouteProps } from '@/utils/mapFeatures.util';

interface RouteLinesProps {
  routes: FeatureCollection<LineString, RouteProps>;
}

/** One aurora (teal to violet) line per journey, through its memories in route order. */
export const RouteLines = ({ routes }: RouteLinesProps): ReactNode => (
  // lineMetrics is what lets the gradient follow the line's length.
  <GeoJSONSource id="routes" data={routes} lineMetrics>
    <Layer type="line" id="route-lines" layout={routeLayout} paint={routeLinePaint} />
  </GeoJSONSource>
);
