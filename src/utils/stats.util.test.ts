import type { Feature, Polygon } from 'geojson';

import { routeDistanceKm } from './geo.util';
import type { RegionData } from './region.util';
import {
  EARTH_CIRCUMFERENCE_KM,
  computeStats,
  resolveRegions,
  type StatsJourney,
  type StatsStop,
} from './stats.util';

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

// A toy world: "India" with two states (Goa west, Kerala east), "France" and "Japan".
const toy: RegionData = {
  countries: {
    type: 'FeatureCollection',
    features: [
      country('IN', 'India', square(0, 0, 10, 10)),
      country('FR', 'France', square(20, 0, 30, 10)),
      country('JP', 'Japan', square(40, 0, 50, 10)),
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

const day = (year: number, month: number, date: number): number =>
  new Date(year, month - 1, date, 12).getTime();

const NOW = day(2026, 11, 10);

const journey = (
  id: string,
  startDate: number,
  endDate: number | null = startDate,
): StatsJourney => ({ id, startDate, endDate });

let counter = 0;
const stop = (
  journeyId: string,
  orderIndex: number,
  longitude: number,
  visitedAt: number,
  extra: Partial<StatsStop> = {},
): StatsStop => {
  counter += 1;
  return {
    id: `s${counter}`,
    journeyId,
    orderIndex,
    visitedAt,
    latitude: 5,
    longitude,
    altitude: null,
    title: `Memory ${counter}`,
    placeName: null,
    photoCount: 0,
    ...extra,
  };
};

const stats = (
  journeys: StatsJourney[],
  stops: StatsStop[],
  filter: 'all' | number = 'all',
  now = NOW,
) => computeStats(journeys, resolveRegions(stops, toy), filter, now);

describe('resolveRegions', () => {
  it('attaches country and state, and null at sea', () => {
    const resolved = resolveRegions(
      [stop('a', 0, 2, 1), stop('a', 1, 25, 1), stop('a', 2, 15, 1)],
      toy,
    );
    expect(resolved[0].region).toEqual({ countryCode: 'IN', countryName: 'India', state: 'Goa' });
    expect(resolved[1].region).toEqual({ countryCode: 'FR', countryName: 'France', state: null });
    expect(resolved[2].region).toBeNull();
  });

  it('gives the same answer on a repeat call with the bundled data, and keeps fixtures apart', () => {
    // Real coordinates: Mumbai is in India, Lisbon in Portugal.
    const points = [
      stop('a', 0, 72.8777, 1, { latitude: 19.076 }),
      stop('a', 1, -9.1393, 1, { latitude: 38.7223 }),
    ];
    const first = resolveRegions(points);
    const second = resolveRegions(points);
    expect(second.map((s) => s.region)).toEqual(first.map((s) => s.region));
    expect(first[0].region?.countryCode).toBe('IN');
    expect(first[1].region?.countryCode).toBe('PT');
    // The toy fixture puts (19.076, 72.8777) nowhere, so the bundled answers must not leak into it.
    expect(resolveRegions([points[0]], toy)[0].region).toBeNull();
  });
});

describe('computeStats: distance', () => {
  const trips = [journey('a', day(2025, 3, 1)), journey('b', day(2025, 6, 1))];

  it('sums each journey in route order, not the jump between journeys', () => {
    const a = [stop('a', 0, 1, day(2025, 3, 1)), stop('a', 1, 4, day(2025, 3, 1))];
    const b = [stop('b', 0, 22, day(2025, 6, 1)), stop('b', 1, 25, day(2025, 6, 1))];
    const expected = routeDistanceKm([a[0], a[1]]) + routeDistanceKm([b[0], b[1]]);
    const result = stats(trips, [...a, ...b]);
    expect(result.distanceKm).toBeCloseTo(expected, 6);
    expect(result.distanceKm).toBeLessThan(routeDistanceKm([a[0], a[1], b[0], b[1]]));
  });

  it('follows orderIndex, whatever order the rows arrive in', () => {
    const first = stop('a', 0, 1, day(2025, 3, 1));
    const second = stop('a', 1, 9, day(2025, 3, 1));
    const third = stop('a', 2, 3, day(2025, 3, 1));
    const result = stats(trips, [third, first, second]);
    expect(result.distanceKm).toBeCloseTo(routeDistanceKm([first, second, third]), 6);
  });

  it('gives the share of the way around the Earth, uncapped', () => {
    const result = stats(trips, [stop('a', 0, 0, 1), stop('a', 1, 40, 1)]);
    expect(result.earthFraction).toBeCloseTo(result.distanceKm / EARTH_CIRCUMFERENCE_KM, 9);
  });

  it('counts a memory at sea for distance but not for regions', () => {
    const result = stats(trips, [stop('a', 0, 2, 1), stop('a', 1, 15, 1)]);
    expect(result.distanceKm).toBeGreaterThan(0);
    expect(result.countryCount).toBe(1);
  });
});

describe('computeStats: regions', () => {
  const trips = [journey('a', day(2024, 3, 1)), journey('b', day(2025, 6, 1))];

  it('counts distinct countries', () => {
    const result = stats(trips, [
      stop('a', 0, 2, day(2024, 3, 1)),
      stop('a', 1, 3, day(2024, 3, 2)),
      stop('b', 0, 25, day(2025, 6, 1)),
    ]);
    expect(result.visited).toEqual({ countryCodes: ['FR', 'IN'], states: ['Goa'] });
    expect(result.countryCount).toBe(2);
  });

  it('counts countries new in the current year against all memories ever', () => {
    const stops = [
      stop('a', 0, 2, day(2024, 3, 1)),
      stop('b', 0, 2, day(2026, 2, 1)),
      stop('b', 1, 25, day(2026, 2, 2)),
      stop('b', 2, 45, day(2026, 2, 3)),
    ];
    const twoYears = [journey('a', day(2024, 3, 1)), journey('b', day(2026, 2, 1))];
    // India was first seen in 2024, so only France and Japan are new in 2026.
    expect(stats(twoYears, stops).newCountries).toBe(2);
    expect(stats(twoYears, stops).basisYear).toBe(2026);
    expect(stats(twoYears, stops, 2024).newCountries).toBe(1);
    expect(stats(twoYears, stops, 2024).basisYear).toBe(2024);
  });
});

describe('computeStats: totals', () => {
  it('counts journeys, memories and photos, and days away with an ongoing trip', () => {
    const trips = [
      journey('a', day(2026, 11, 1), day(2026, 11, 3)),
      journey('b', day(2026, 11, 8), null),
    ];
    const result = stats(trips, [
      stop('a', 0, 2, day(2026, 11, 1), { photoCount: 3 }),
      stop('a', 1, 3, day(2026, 11, 2), { photoCount: 2 }),
      stop('b', 0, 7, day(2026, 11, 8)),
    ]);
    expect(result.journeyCount).toBe(2);
    expect(result.memoryCount).toBe(3);
    expect(result.photoCount).toBe(5);
    // 3 days, then 8 to 10 November inclusive = 3 days.
    expect(result.daysAway).toBe(6);
  });

  it('reports the earliest journey and the chip years', () => {
    const result = stats(
      [journey('a', day(2023, 5, 1)), journey('b', day(2025, 5, 1)), journey('c', day(2025, 8, 1))],
      [],
    );
    expect(result.firstJourneyAt).toBe(day(2023, 5, 1));
    expect(result.years).toEqual([2025, 2023]);
  });
});

describe('computeStats: highest point', () => {
  const trips = [journey('a', day(2025, 3, 1))];

  it('is the highest memory with an altitude, named by its place', () => {
    const result = stats(trips, [
      stop('a', 0, 2, 1, { altitude: 2960, placeName: 'Kalpa', title: 'Apples' }),
      stop('a', 1, 3, 1, { altitude: 4270, placeName: 'Kibber', title: 'Kibber at 4,200 m' }),
      stop('a', 2, 4, 1),
    ]);
    expect(result.highestPoint).toEqual({ altitude: 4270, name: 'Kibber' });
  });

  it('falls back to the memory title and counts sea level', () => {
    const result = stats(trips, [stop('a', 0, 2, 1, { altitude: 0, title: 'Beach' })]);
    expect(result.highestPoint).toEqual({ altitude: 0, name: 'Beach' });
  });

  it('is null when no memory has an altitude', () => {
    expect(stats(trips, [stop('a', 0, 2, 1)]).highestPoint).toBeNull();
  });
});

describe('computeStats: per year', () => {
  const trips = [
    journey('a', day(2023, 3, 1)),
    journey('b', day(2025, 4, 1)),
    journey('c', day(2025, 9, 1)),
  ];
  const stops = [
    stop('a', 0, 2, day(2023, 3, 1)),
    stop('a', 1, 3, day(2023, 3, 1)),
    stop('b', 0, 2, day(2025, 4, 1)),
    stop('b', 1, 7, day(2025, 4, 2)),
    stop('c', 0, 2, day(2025, 9, 1)),
    stop('c', 1, 25, day(2025, 9, 2)),
  ];

  it('counts journeys per year with gap years as zero', () => {
    expect(stats(trips, stops).journeysPerYear).toEqual([
      { year: 2023, count: 1 },
      { year: 2024, count: 0 },
      { year: 2025, count: 2 },
    ]);
  });

  it('keeps every year in the chart when a year is chosen', () => {
    expect(stats(trips, stops, 2025).journeysPerYear).toHaveLength(3);
  });
});

describe('computeStats: year filter', () => {
  const trips = [journey('a', day(2024, 3, 1)), journey('b', day(2025, 6, 1))];
  const stops = [
    stop('a', 0, 2, day(2024, 3, 1), { photoCount: 4 }),
    stop('b', 0, 25, day(2025, 6, 1), { photoCount: 1 }),
    stop('b', 1, 26, day(2025, 6, 2), { photoCount: 1 }),
  ];

  it('keeps only the journeys that start that year, and their memories', () => {
    const result = stats(trips, stops, 2025);
    expect(result.journeyCount).toBe(1);
    expect(result.memoryCount).toBe(2);
    expect(result.photoCount).toBe(2);
    expect(result.visited.countryCodes).toEqual(['FR']);
  });

  it('still reports the first journey and chip years of all time', () => {
    const result = stats(trips, stops, 2025);
    expect(result.firstJourneyAt).toBe(day(2024, 3, 1));
    expect(result.years).toEqual([2025, 2024]);
  });
});

describe('computeStats: nothing yet', () => {
  it('gives zeros, nulls and empty lists', () => {
    const result = stats([], []);
    expect(result).toMatchObject({
      distanceKm: 0,
      earthFraction: 0,
      countryCount: 0,
      newCountries: 0,
      journeyCount: 0,
      daysAway: 0,
      memoryCount: 0,
      photoCount: 0,
      highestPoint: null,
      journeysPerYear: [],
      firstJourneyAt: null,
      years: [],
    });
  });
});
