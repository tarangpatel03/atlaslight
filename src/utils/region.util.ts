import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { Feature, FeatureCollection, GeoJsonProperties, Position } from 'geojson';

import {
  type CountryProps,
  type RegionShape,
  type StateProps,
  countries,
  indiaStates,
} from '@/assets/geo';
import type { LatLng } from '@/utils/geo.util';

export type RegionData = {
  countries: FeatureCollection<RegionShape, CountryProps>;
  states: FeatureCollection<RegionShape, StateProps>;
};

/** Where a point is: its country and, inside India, its state or union territory. */
export type Region = { countryCode: string; countryName: string; state: string | null };

export type VisitedRegions = { countryCodes: string[]; states: string[] };

const INDIA_CODE = 'IN';

export const bundled: RegionData = { countries, states: indiaStates };

type Box = [number, number, number, number];

// Bounding boxes are computed once per feature; most points are rejected by a box test alone.
const boxes = new WeakMap<Feature, Box>();

const extend = (box: Box, value: unknown): void => {
  if (!Array.isArray(value)) return;
  if (typeof value[0] === 'number') {
    const [lng, lat] = value as Position; // a position, as the array check above guarantees
    box[0] = Math.min(box[0], lng);
    box[1] = Math.min(box[1], lat);
    box[2] = Math.max(box[2], lng);
    box[3] = Math.max(box[3], lat);
    return;
  }
  value.forEach((inner) => extend(box, inner));
};

const boxOf = (feature: Feature<RegionShape, GeoJsonProperties>): Box => {
  const cached = boxes.get(feature);
  if (cached) return cached;
  const box: Box = [Infinity, Infinity, -Infinity, -Infinity];
  extend(box, feature.geometry.coordinates);
  boxes.set(feature, box);
  return box;
};

const findContaining = <P extends GeoJsonProperties>(
  collection: FeatureCollection<RegionShape, P>,
  { latitude, longitude }: LatLng,
): Feature<RegionShape, P> | null => {
  for (const feature of collection.features) {
    const [west, south, east, north] = boxOf(feature);
    if (longitude < west || longitude > east || latitude < south || latitude > north) continue;
    if (booleanPointInPolygon([longitude, latitude], feature)) return feature;
  }
  return null;
};

/**
 * Country and (in India) state of a point, from the bundled GeoJSON, so it works offline.
 * Null at sea. `data` exists so tests can pass small fixtures.
 */
export const regionOf = (point: LatLng, data: RegionData = bundled): Region | null => {
  const country = findContaining(data.countries, point);
  const stateFeature =
    !country || country.properties.iso2 === INDIA_CODE ? findContaining(data.states, point) : null;
  const state = stateFeature?.properties.name ?? null;

  if (country) {
    return { countryCode: country.properties.iso2, countryName: country.properties.name, state };
  }
  // The simplified state shapes can reach a few hundred metres past the country coast.
  return state ? { countryCode: INDIA_CODE, countryName: 'India', state } : null;
};

/** Distinct countries and Indian states/UTs a set of stops touched, each sorted. */
export const visitedRegions = (points: LatLng[], data: RegionData = bundled): VisitedRegions => {
  const countryCodes = new Set<string>();
  const states = new Set<string>();
  const seen = new Set<string>();
  for (const point of points) {
    // Stops of one trip often share a spot; look each ~10 m cell up once.
    const key = `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const region = regionOf(point, data);
    if (!region) continue;
    countryCodes.add(region.countryCode);
    if (region.state) states.add(region.state);
  }
  return { countryCodes: [...countryCodes].sort(), states: [...states].sort() };
};

/** The shapes to fill on the map for the visited countries and states. */
export const visitedFeatures = (
  visited: VisitedRegions,
  data: RegionData = bundled,
): RegionData => ({
  countries: {
    type: 'FeatureCollection',
    features: data.countries.features.filter((f) =>
      visited.countryCodes.includes(f.properties.iso2),
    ),
  },
  states: {
    type: 'FeatureCollection',
    features: data.states.features.filter((f) => visited.states.includes(f.properties.name)),
  },
});
