import distance from '@turf/distance';
import type { Feature, FeatureCollection, LineString, Point, Position } from 'geojson';

/** What the map needs from a stop. The map data API (`map.api.ts`) fills it from the database. */
export type MapStop = {
  id: string;
  journeyId: string;
  latitude: number;
  longitude: number;
  title: string;
  visitedAt: number;
  orderIndex: number;
  /** The journey's accent colour. */
  color: string;
  coverThumbnailPath: string | null;
};

export type PinProps = {
  id: string;
  journeyId: string;
  title: string;
  color: string;
  visitedAt: number;
  coverThumbnailPath: string | null;
};

export type RouteProps = { journeyId: string; color: string };

/** [west, south, east, north] in degrees. */
export type Bounds = [number, number, number, number];

/** What the Map chips show: everything, the ongoing journey, favourites, or one journey. */
export type MapFilter =
  { kind: 'all' | 'ongoing' | 'favourites' } | { kind: 'journey'; journeyId: string };

type Filterable = MapStop & { isFavorite: boolean; isOngoing: boolean };

/** Stops that pass the chip filter. A journey that no longer exists matches nothing. */
export const filterMapStops = <T extends Filterable>(stops: T[], filter: MapFilter): T[] => {
  switch (filter.kind) {
    case 'all':
      return stops;
    case 'ongoing':
      return stops.filter((stop) => stop.isOngoing);
    case 'favourites':
      return stops.filter((stop) => stop.isFavorite);
    case 'journey':
      return stops.filter((stop) => stop.journeyId === filter.journeyId);
  }
};

/** One Point per stop; the pin layer and its clustering read this. */
export const stopsToPoints = (stops: MapStop[]): FeatureCollection<Point, PinProps> => ({
  type: 'FeatureCollection',
  features: stops.map((stop) => ({
    type: 'Feature',
    id: stop.id,
    properties: {
      id: stop.id,
      journeyId: stop.journeyId,
      title: stop.title,
      color: stop.color,
      visitedAt: stop.visitedAt,
      coverThumbnailPath: stop.coverThumbnailPath,
    },
    geometry: { type: 'Point', coordinates: [stop.longitude, stop.latitude] },
  })),
});

/**
 * One line per journey through its stops in route order. A journey with fewer than two stops has
 * no route. Limit: a leg that crosses the antimeridian is drawn the long way round (not handled in v1).
 */
export const journeyRoutes = (stops: MapStop[]): FeatureCollection<LineString, RouteProps> => {
  const byJourney = new Map<string, MapStop[]>();
  for (const stop of stops) {
    byJourney.set(stop.journeyId, [...(byJourney.get(stop.journeyId) ?? []), stop]);
  }

  const features: Feature<LineString, RouteProps>[] = [];
  for (const [journeyId, journeyStops] of byJourney) {
    if (journeyStops.length < 2) continue;
    const ordered = [...journeyStops].sort((a, b) => a.orderIndex - b.orderIndex);
    features.push({
      type: 'Feature',
      id: journeyId,
      properties: { journeyId, color: ordered[0].color },
      geometry: {
        type: 'LineString',
        coordinates: ordered.map((stop) => [stop.longitude, stop.latitude]),
      },
    });
  }
  return { type: 'FeatureCollection', features };
};

// About 5 km: a single stop, or stops in one town, still frame a readable area.
const MIN_SPAN_DEGREES = 0.05;

/** Box around the stops for fit-to-bounds; null with no stops. Never smaller than a town. */
export const stopsBounds = (stops: Pick<MapStop, 'latitude' | 'longitude'>[]): Bounds | null => {
  if (stops.length === 0) return null;
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const { latitude, longitude } of stops) {
    west = Math.min(west, longitude);
    east = Math.max(east, longitude);
    south = Math.min(south, latitude);
    north = Math.max(north, latitude);
  }

  const pad = (low: number, high: number): [number, number] => {
    const missing = Math.max(0, MIN_SPAN_DEGREES - (high - low));
    return [low - missing / 2, high + missing / 2];
  };
  const [paddedWest, paddedEast] = pad(west, east);
  const [paddedSouth, paddedNorth] = pad(south, north);
  return [paddedWest, paddedSouth, paddedEast, paddedNorth];
};

/**
 * The part of a route from its start to `fraction` (0 to 1) of its length, ending on a point
 * interpolated inside the current leg; `head` is that end point. Null for fewer than two points.
 * Used by Replay route to draw the line growing.
 */
export const routeSlice = (
  coordinates: Position[],
  fraction: number,
): { line: Position[]; head: Position } | null => {
  if (coordinates.length < 2) return null;
  const legs = coordinates.slice(1).map((to, i) => distance(coordinates[i], to));
  const total = legs.reduce((sum, leg) => sum + leg, 0);
  const clamped = Math.min(1, Math.max(0, fraction));
  const last = coordinates[coordinates.length - 1];
  if (total === 0 || clamped >= 1) return { line: coordinates, head: last };

  let remaining = clamped * total;
  const line: Position[] = [coordinates[0]];
  for (let i = 0; i < legs.length; i += 1) {
    if (remaining >= legs[i]) {
      remaining -= legs[i];
      line.push(coordinates[i + 1]);
      continue;
    }
    const t = legs[i] === 0 ? 0 : remaining / legs[i];
    const [fromLng, fromLat] = coordinates[i];
    const [toLng, toLat] = coordinates[i + 1];
    const head: Position = [fromLng + (toLng - fromLng) * t, fromLat + (toLat - fromLat) * t];
    line.push(head);
    return { line, head };
  }
  return { line, head: last };
};
