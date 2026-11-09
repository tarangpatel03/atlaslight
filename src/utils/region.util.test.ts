import type { Feature, Polygon } from 'geojson';

import { type RegionData, regionOf, visitedFeatures, visitedRegions } from './region.util';

const square = (west: number, south: number, east: number, north: number): Polygon => ({
  type: 'Polygon',
  coordinates: [
    [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ],
  ],
});

const country = (
  iso2: string,
  name: string,
  geometry: Polygon,
): Feature<Polygon, { iso2: string; name: string }> => ({
  type: 'Feature',
  properties: { iso2, name },
  geometry,
});

// A toy world: "India" (IN) with two states, and "France" (FR) next to it.
const toy: RegionData = {
  countries: {
    type: 'FeatureCollection',
    features: [
      country('IN', 'India', square(0, 0, 10, 10)),
      country('FR', 'France', square(20, 0, 30, 10)),
    ],
  },
  states: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { name: 'Goa' }, geometry: square(0, 0, 5, 10) },
      { type: 'Feature', properties: { name: 'Kerala' }, geometry: square(5, 0, 10, 10) },
    ],
  },
};

const at = (latitude: number, longitude: number) => ({ latitude, longitude });

describe('regionOf (fixtures)', () => {
  it('returns country and state inside India', () => {
    expect(regionOf(at(5, 2), toy)).toEqual({
      countryCode: 'IN',
      countryName: 'India',
      state: 'Goa',
    });
  });

  it('returns no state outside India', () => {
    expect(regionOf(at(5, 25), toy)).toEqual({
      countryCode: 'FR',
      countryName: 'France',
      state: null,
    });
  });

  it('returns null at sea', () => {
    expect(regionOf(at(5, 15), toy)).toBeNull();
  });

  it('keeps India when a state reaches past the simplified coast', () => {
    const coast: RegionData = {
      countries: { type: 'FeatureCollection', features: [] },
      states: toy.states,
    };
    expect(regionOf(at(5, 2), coast)).toEqual({
      countryCode: 'IN',
      countryName: 'India',
      state: 'Goa',
    });
  });

  it('handles empty collections', () => {
    const empty: RegionData = {
      countries: { type: 'FeatureCollection', features: [] },
      states: { type: 'FeatureCollection', features: [] },
    };
    expect(regionOf(at(5, 5), empty)).toBeNull();
  });
});

describe('regionOf (bundled data)', () => {
  it('finds Delhi', () => {
    expect(regionOf(at(28.6139, 77.209))).toMatchObject({ countryCode: 'IN', state: 'Delhi' });
  });

  it('finds Leh in Ladakh', () => {
    expect(regionOf(at(34.1526, 77.5771))).toMatchObject({ countryCode: 'IN', state: 'Ladakh' });
  });

  it('finds Kaza in Himachal Pradesh', () => {
    expect(regionOf(at(32.2276, 78.0719))).toMatchObject({
      countryCode: 'IN',
      state: 'Himachal Pradesh',
    });
  });

  it('finds Panaji in Goa', () => {
    expect(regionOf(at(15.4909, 73.8278))).toMatchObject({ countryCode: 'IN', state: 'Goa' });
  });

  it('finds Paris in France (Natural Earth marks France -99)', () => {
    expect(regionOf(at(48.8566, 2.3522))).toEqual({
      countryCode: 'FR',
      countryName: 'France',
      state: null,
    });
  });

  it('finds Oslo in Norway (also -99)', () => {
    expect(regionOf(at(59.9139, 10.7522))?.countryCode).toBe('NO');
  });

  it('finds Singapore', () => {
    expect(regionOf(at(1.3521, 103.8198))?.countryCode).toBe('SG');
  });

  it('returns null in the middle of the Atlantic', () => {
    expect(regionOf(at(0, -30))).toBeNull();
  });
});

describe('visitedRegions', () => {
  it('collapses duplicates and sorts', () => {
    const visited = visitedRegions([at(5, 7), at(5, 2), at(5, 2), at(5, 25)], toy);
    expect(visited).toEqual({ countryCodes: ['FR', 'IN'], states: ['Goa', 'Kerala'] });
  });

  it('ignores points at sea and adds no state outside India', () => {
    const visited = visitedRegions([at(5, 15), at(5, 25)], toy);
    expect(visited).toEqual({ countryCodes: ['FR'], states: [] });
  });

  it('is empty for no points', () => {
    expect(visitedRegions([], toy)).toEqual({ countryCodes: [], states: [] });
  });

  it('counts a real trip: Delhi, Leh, Goa, Paris', () => {
    const visited = visitedRegions([
      at(28.6139, 77.209),
      at(34.1526, 77.5771),
      at(15.4909, 73.8278),
      at(48.8566, 2.3522),
    ]);
    expect(visited.countryCodes).toEqual(['FR', 'IN']);
    expect(visited.states).toEqual(['Delhi', 'Goa', 'Ladakh']);
  });
});

describe('visitedFeatures', () => {
  it('keeps only the visited shapes', () => {
    const shapes = visitedFeatures({ countryCodes: ['FR'], states: ['Kerala'] }, toy);
    expect(shapes.countries.features.map((f) => f.properties.iso2)).toEqual(['FR']);
    expect(shapes.states.features.map((f) => f.properties.name)).toEqual(['Kerala']);
  });

  it('is empty when nothing was visited', () => {
    const shapes = visitedFeatures({ countryCodes: [], states: [] }, toy);
    expect(shapes.countries.features).toHaveLength(0);
    expect(shapes.states.features).toHaveLength(0);
  });
});
