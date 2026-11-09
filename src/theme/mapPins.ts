import type { CircleLayerSpecification, SymbolLayerSpecification } from '@maplibre/maplibre-react-native';

import { colors } from './colors';

type CirclePaint = NonNullable<CircleLayerSpecification['paint']>;
type SymbolPaint = NonNullable<SymbolLayerSpecification['paint']>;

/** Pin sizes and map-layer paint for memories on the map. Amber = memory; the ring marks the selected one. */
export const mapPins = {
  /** Photo pin (React view) diameter and ring width. */
  photoSize: 52,
  photoSizeSelected: 62,
  ringWidth: 3,
  /** Dot (native layer) radius at world zoom and at street zoom. */
  dotRadius: [4.5, 8] as const,
  /** Cluster circle radius by how many memories it holds: under 10, under 50, more. */
  clusterRadius: [15, 19, 24] as const,
  /** Photo pins appear from this zoom; fewer than this many stay on screen at once. */
  photoMinZoom: 6,
  photoMaxCount: 40,
  /** Clustering: radius in px and the last zoom that clusters (street zoom shows every pin). */
  clusterPixelRadius: 50,
  clusterMaxZoom: 12,
} as const;

/** Paint for the layers drawn from the clustered source of memories. */
export const mapPinPaint: {
  cluster: CirclePaint;
  clusterCount: SymbolPaint;
  dot: CirclePaint;
  selected: CirclePaint;
} = {
  cluster: {
    'circle-color': colors.amber,
    'circle-stroke-color': colors.bg,
    'circle-stroke-width': 2,
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      mapPins.clusterRadius[0],
      10,
      mapPins.clusterRadius[1],
      50,
      mapPins.clusterRadius[2],
    ],
  },
  clusterCount: {
    'text-color': colors.onAmber,
  },
  dot: {
    'circle-color': colors.amber,
    'circle-stroke-color': colors.bg,
    'circle-stroke-width': 1.5,
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      mapPins.dotRadius[0],
      12,
      mapPins.dotRadius[1],
    ],
  },
  selected: {
    'circle-color': 'rgba(0, 0, 0, 0)',
    'circle-stroke-color': colors.amber,
    'circle-stroke-width': 2.5,
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2,
      mapPins.dotRadius[0] + 5,
      12,
      mapPins.dotRadius[1] + 5,
    ],
  },
};
