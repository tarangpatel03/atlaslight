import { routeDistanceKm } from '@/utils/geo.util';
import { journeyYears, tripDays } from '@/utils/journey.util';
import {
  bundled,
  regionOf,
  type Region,
  type RegionData,
  type VisitedRegions,
} from '@/utils/region.util';

/** Length of the equator, for "how far around the Earth". */
export const EARTH_CIRCUMFERENCE_KM = 40_075;

export type StatsJourney = { id: string; startDate: number; endDate: number | null };

/** What the stats read from one memory; the stats API fills it from the database. */
export type StatsStop = {
  id: string;
  journeyId: string;
  orderIndex: number;
  visitedAt: number;
  latitude: number;
  longitude: number;
  /** Metres above sea level, null when unknown. */
  altitude: number | null;
  title: string;
  placeName: string | null;
  photoCount: number;
};

/** A memory with the country and state it lies in (null at sea). */
export type ResolvedStop = StatsStop & { region: Region | null };

/** 'all' or one start year; a journey counts for the year it starts in. */
export type StatsFilter = 'all' | number;

export type Stats = {
  distanceKm: number;
  /** Distance over the Earth's circumference; can pass 1 for a long traveller. */
  earthFraction: number;
  visited: VisitedRegions;
  countryCount: number;
  /** Countries visited for the first time ever in `basisYear`. */
  newCountries: number;
  /** The chip's year, or the current year for All time. */
  basisYear: number;
  journeyCount: number;
  daysAway: number;
  memoryCount: number;
  photoCount: number;
  /** The highest memory that has an altitude; null hides the tile. */
  highestPoint: { altitude: number; name: string } | null;
  /** Every year from the first journey to the last, zeros included; the filter does not change it. */
  journeysPerYear: { year: number; count: number }[];
  /** Earliest start of any journey ("Since March 2019"). */
  firstJourneyAt: number | null;
  /** Start years for the chips, newest first. */
  years: number[];
};

const yearOf = (ms: number): number => new Date(ms).getFullYear();

/**
 * Looks up the country and state of every memory once. The lookup is the costly part of the stats,
 * so callers keep the result and only rerun `computeStats` when the chip changes.
 */
export const resolveRegions = (stops: StatsStop[], data: RegionData = bundled): ResolvedStop[] => {
  // Memories of one trip often share a spot; each ~10 m cell is looked up once.
  const cache = new Map<string, Region | null>();
  return stops.map((stop) => {
    const key = `${stop.latitude.toFixed(4)},${stop.longitude.toFixed(4)}`;
    let region = cache.get(key);
    if (region === undefined) {
      region = regionOf(stop, data);
      cache.set(key, region);
    }
    return { ...stop, region };
  });
};

const groupBy = <T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> => {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
};

/** Earliest `visitedAt` per key (a country code or a state name). */
const firstVisits = (
  stops: ResolvedStop[],
  keyOf: (stop: ResolvedStop) => string | null,
): Map<string, number> => {
  const first = new Map<string, number>();
  for (const stop of stops) {
    const key = keyOf(stop);
    if (key === null) continue;
    const seen = first.get(key);
    if (seen === undefined || stop.visitedAt < seen) first.set(key, stop.visitedAt);
  }
  return first;
};

const perYear = (journeys: StatsJourney[]): Stats['journeysPerYear'] => {
  if (journeys.length === 0) return [];
  const counts = new Map<number, number>();
  for (const journey of journeys) {
    const year = yearOf(journey.startDate);
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  const years = [...counts.keys()];
  const first = Math.min(...years);
  const last = Math.max(...years);
  const rows: Stats['journeysPerYear'] = [];
  for (let year = first; year <= last; year += 1) rows.push({ year, count: counts.get(year) ?? 0 });
  return rows;
};

/**
 * Every number on the Stats screen for the chosen year (or all time). Pure: `now` is
 * passed in so tests are exact. Memories come from `resolveRegions`.
 */
export const computeStats = (
  journeys: StatsJourney[],
  stops: ResolvedStop[],
  filter: StatsFilter,
  now: number,
): Stats => {
  const chosen =
    filter === 'all'
      ? journeys
      : journeys.filter((journey) => yearOf(journey.startDate) === filter);
  const chosenIds = new Set(chosen.map((journey) => journey.id));
  const picked = stops.filter((stop) => chosenIds.has(stop.journeyId));

  let distanceKm = 0;
  for (const route of groupBy(picked, (stop) => stop.journeyId).values()) {
    distanceKm += routeDistanceKm([...route].sort((a, b) => a.orderIndex - b.orderIndex));
  }

  const countryCodes = new Set<string>();
  for (const stop of picked) if (stop.region) countryCodes.add(stop.region.countryCode);
  const stateFirst = firstVisits(picked, (stop) => stop.region?.state ?? null);
  const visited: VisitedRegions = {
    countryCodes: [...countryCodes].sort(),
    states: [...stateFirst.keys()].sort(),
  };

  // "New" is measured against every memory ever, so a country seen in 2023 is not new in 2025.
  const basisYear = filter === 'all' ? yearOf(now) : filter;
  const countryFirst = firstVisits(stops, (stop) => stop.region?.countryCode ?? null);
  const newCountries = [...countryFirst.values()].filter((ms) => yearOf(ms) === basisYear).length;

  let highestPoint: Stats['highestPoint'] = null;
  for (const stop of picked) {
    if (stop.altitude === null) continue;
    if (!highestPoint || stop.altitude > highestPoint.altitude) {
      highestPoint = { altitude: stop.altitude, name: stop.placeName ?? stop.title };
    }
  }

  return {
    distanceKm,
    earthFraction: distanceKm / EARTH_CIRCUMFERENCE_KM,
    visited,
    countryCount: visited.countryCodes.length,
    newCountries,
    basisYear,
    journeyCount: chosen.length,
    daysAway: chosen.reduce((sum, j) => sum + tripDays(j.startDate, j.endDate, now), 0),
    memoryCount: picked.length,
    photoCount: picked.reduce((sum, stop) => sum + stop.photoCount, 0),
    highestPoint,
    journeysPerYear: perYear(journeys),
    firstJourneyAt: journeys.length > 0 ? Math.min(...journeys.map((j) => j.startDate)) : null,
    years: journeyYears(journeys),
  };
};
