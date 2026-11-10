import type { Position } from 'geojson';

import type { RegionShape } from '@/assets/geo';
import type { Bounds } from '@/utils/mapFeatures.util';
import { bundled, type RegionData, type VisitedRegions } from '@/utils/region.util';

export type Size = { width: number; height: number };

/** Longitude/latitude to a point in the drawing box, in px. */
export type Projector = (position: Position) => [number, number];

export type ScratchPaths = {
  /** SVG path data for the shapes not visited yet. */
  land: string;
  /** SVG path data for the visited shapes. */
  visited: string;
};

const ANTARCTICA = 'AQ';
/** The world frame leaves out Antarctica's ice and the far north, which only waste space. */
const WORLD_BOUNDS: Bounds = [-180, -58, 180, 84];
const PADDING = 8;
/** Vertices closer than this (px) to the last kept one add nothing to the picture. */
const MIN_STEP = 0.4;
/** Rings smaller than this (px) in both directions are specks. */
const MIN_SIZE = 1;

const rad = (degrees: number): number => (degrees * Math.PI) / 180;

const round = (value: number): number => Math.round(value * 10) / 10;

/**
 * A plate carrée projection that fits `bounds` into the box and centres it. Longitude is scaled by the
 * cosine of the middle latitude, so a country keeps its proportions away from the equator.
 */
export const fitProjection = (bounds: Bounds, size: Size, padding: number = 0): Projector => {
  const [west, south, east, north] = bounds;
  const xScale = Math.cos(rad((south + north) / 2));
  const spanX = Math.max((east - west) * xScale, 1e-6);
  const spanY = Math.max(north - south, 1e-6);
  const scale = Math.min(
    Math.max(size.width - 2 * padding, 1) / spanX,
    Math.max(size.height - 2 * padding, 1) / spanY,
  );
  const offsetX = (size.width - spanX * scale) / 2;
  const offsetY = (size.height - spanY * scale) / 2;
  return ([longitude, latitude]) => [
    offsetX + (longitude - west) * xScale * scale,
    offsetY + (north - latitude) * scale,
  ];
};

/** One ring as `M x y L x y … Z`; empty when too little is left of it to see. */
export const ringToPath = (ring: Position[], project: Projector): string => {
  const points: [number, number][] = [];
  for (const position of ring) {
    const point = project(position);
    const last = points[points.length - 1];
    if (
      last &&
      Math.abs(point[0] - last[0]) < MIN_STEP &&
      Math.abs(point[1] - last[1]) < MIN_STEP
    ) {
      continue;
    }
    points.push(point);
  }
  // A ring ends on its first vertex.
  const first = points[0];
  const end = points[points.length - 1];
  if (
    points.length > 1 &&
    Math.abs(first[0] - end[0]) < MIN_STEP &&
    Math.abs(first[1] - end[1]) < MIN_STEP
  ) {
    points.pop();
  }
  if (points.length < 3) return '';
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  if (
    Math.max(...xs) - Math.min(...xs) < MIN_SIZE &&
    Math.max(...ys) - Math.min(...ys) < MIN_SIZE
  ) {
    return '';
  }
  return `M${points.map(([x, y]) => `${round(x)} ${round(y)}`).join('L')}Z`;
};

/** A country or state outline (with its holes and islands) as one path string. */
export const shapeToPath = (shape: RegionShape, project: Projector): string => {
  const polygons = shape.type === 'Polygon' ? [shape.coordinates] : shape.coordinates;
  return polygons.map((rings) => rings.map((ring) => ringToPath(ring, project)).join('')).join('');
};

/** Height for a scratch map `width` dp wide: fits the world's wide shape without empty bands above and below. */
export const scratchMapHeight = (width: number): number => {
  const [west, south, east, north] = WORLD_BOUNDS;
  const spanX = (east - west) * Math.cos(rad((south + north) / 2));
  const spanY = north - south;
  return Math.round(((width - 2 * PADDING) * spanY) / spanX + 2 * PADDING);
};

/**
 * The scratch map as two path strings (not visited, visited) for a box of `size`: every country but
 * Antarctica. Codes that match nothing are ignored.
 */
export const buildScratchPaths = (
  visited: VisitedRegions,
  size: Size,
  data: RegionData = bundled,
): ScratchPaths => {
  if (size.width <= 0 || size.height <= 0) return { land: '', visited: '' };
  const visitedCountries = new Set(visited.countryCodes);
  const project = fitProjection(WORLD_BOUNDS, size, PADDING);
  let land = '';
  let seen = '';
  for (const feature of data.countries.features) {
    if (feature.properties.iso2 === ANTARCTICA) continue;
    const path = shapeToPath(feature.geometry, project);
    if (visitedCountries.has(feature.properties.iso2)) seen += path;
    else land += path;
  }
  return { land, visited: seen };
};
