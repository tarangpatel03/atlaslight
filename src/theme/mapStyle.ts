import { colors } from './colors';

/**
 * Atlaslight dark map style for @maplibre/maplibre-react-native.
 * Tiles: OpenFreeMap (free, no API key), OpenMapTiles schema.
 * Pass it as `mapStyle` on <Map> (wrapped by AtlasMap).
 *
 * Kept deliberately quiet: water darker than land, thin borders, muted labels,
 * roads only at street zoom — so amber pins and aurora routes carry the colour.
 * Visited-region fills, routes and pins are NOT here: the map screen adds them
 * as its own sources/layers on top.
 */
// Same source and glyph URLs as https://tiles.openfreemap.org/styles/dark (checked in 4.2).
const OPENFREEMAP_TILES = 'https://tiles.openfreemap.org/planet';
const OPENFREEMAP_GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

const labelName = ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']];

export const atlaslightMapStyle = {
  version: 8,
  name: 'Atlaslight Dark',
  glyphs: OPENFREEMAP_GLYPHS,
  sources: {
    openmaptiles: { type: 'vector', url: OPENFREEMAP_TILES },
  },
  layers: [
    // Land is the background; water is drawn on top of it.
    { id: 'background', type: 'background', paint: { 'background-color': colors.mapLand } },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': colors.mapWater },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      minzoom: 8,
      paint: {
        'line-color': colors.mapWater,
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 2],
      },
    },
    {
      id: 'roads',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 11,
      filter: [
        'in',
        ['get', 'class'],
        ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor']],
      ],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': colors.mapRoad,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 11, 0.5, 16, 6],
      },
    },
    {
      id: 'state-borders',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 3,
      filter: ['all', ['==', ['get', 'admin_level'], 4], ['==', ['get', 'maritime'], 0]],
      paint: { 'line-color': colors.mapBorder, 'line-width': 0.5, 'line-dasharray': [2, 2] },
    },
    {
      id: 'country-borders',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['all', ['==', ['get', 'admin_level'], 2], ['==', ['get', 'maritime'], 0]],
      paint: {
        'line-color': colors.mapBorder,
        'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.75, 8, 1.5],
      },
    },
    {
      id: 'labels-country',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      maxzoom: 7,
      filter: ['==', ['get', 'class'], 'country'],
      layout: {
        'text-field': labelName,
        'text-font': ['Noto Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 2, 10, 6, 14],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.08,
      },
      paint: {
        'text-color': colors.mapLabel,
        'text-halo-color': colors.mapWater,
        'text-halo-width': 1,
      },
    },
    {
      id: 'labels-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 5,
      filter: ['in', ['get', 'class'], ['literal', ['city', 'town']]],
      layout: {
        'text-field': labelName,
        'text-font': ['Noto Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 5, 10, 12, 14],
      },
      paint: {
        'text-color': colors.mapLabel,
        'text-halo-color': colors.mapWater,
        'text-halo-width': 1,
      },
    },
  ],
} as const;

/** Paint for the visited-regions fill layer the map screen adds over the base style. */
export const visitedRegionPaint = {
  fill: { 'fill-color': colors.amber, 'fill-opacity': 0.16 },
  outline: { 'line-color': colors.amber, 'line-opacity': 0.4, 'line-width': 1 },
} as const;

/** Paint for journey route lines (aurora gradient along the line; needs lineMetrics on the source). */
export const routeLinePaint = {
  'line-width': 3,
  'line-cap': 'round',
  'line-gradient': [
    'interpolate',
    ['linear'],
    ['line-progress'],
    0,
    colors.auroraTeal,
    1,
    colors.auroraViolet,
  ],
} as const;
