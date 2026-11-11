import { MOODS, type Mood } from '@/db/moods';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Journeys start this many days apart, newest first, so 20 of them cover about four years. */
const JOURNEY_SPACING_DAYS = 70;
const JOURNEY_LENGTH_DAYS = 14;

/** Every n-th memory of a journey gets a photo (see `withPhoto`). */
const PHOTO_EVERY = 10;

/** Id prefixes of the test rows; the remove endpoint matches on them. */
export const TEST_JOURNEY_PREFIX = 'perf-';
export const TEST_PLACE_PREFIX = 'perf-place-';

type City = {
  name: string;
  adminArea: string | null;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
};

const city = (
  name: string,
  adminArea: string | null,
  countryCode: string,
  countryName: string,
  latitude: number,
  longitude: number,
): City => ({ name, adminArea, countryCode, countryName, latitude, longitude });

/** City centres around the world, so the map forms clusters on every continent. */
const CITIES: City[] = [
  city('Mumbai', 'Maharashtra', 'IN', 'India', 19.076, 72.8777),
  city('Jaipur', 'Rajasthan', 'IN', 'India', 26.9124, 75.7873),
  city('Kochi', 'Kerala', 'IN', 'India', 9.9312, 76.2673),
  city('Delhi', 'Delhi', 'IN', 'India', 28.6139, 77.209),
  city('Lisbon', null, 'PT', 'Portugal', 38.7223, -9.1393),
  city('Madrid', null, 'ES', 'Spain', 40.4168, -3.7038),
  city('Paris', null, 'FR', 'France', 48.8566, 2.3522),
  city('Rome', null, 'IT', 'Italy', 41.9028, 12.4964),
  city('Berlin', null, 'DE', 'Germany', 52.52, 13.405),
  city('Istanbul', null, 'TR', 'Turkey', 41.0082, 28.9784),
  city('Cairo', null, 'EG', 'Egypt', 30.0444, 31.2357),
  city('Nairobi', null, 'KE', 'Kenya', -1.2921, 36.8219),
  city('Cape Town', null, 'ZA', 'South Africa', -33.9249, 18.4241),
  city('Marrakesh', null, 'MA', 'Morocco', 31.6295, -7.9811),
  city('Dubai', null, 'AE', 'United Arab Emirates', 25.2048, 55.2708),
  city('Bangkok', null, 'TH', 'Thailand', 13.7563, 100.5018),
  city('Singapore', null, 'SG', 'Singapore', 1.3521, 103.8198),
  city('Hanoi', null, 'VN', 'Vietnam', 21.0285, 105.8542),
  city('Tokyo', null, 'JP', 'Japan', 35.6762, 139.6503),
  city('Kyoto', null, 'JP', 'Japan', 35.0116, 135.7681),
  city('Seoul', null, 'KR', 'South Korea', 37.5665, 126.978),
  city('Beijing', null, 'CN', 'China', 39.9042, 116.4074),
  city('Sydney', 'New South Wales', 'AU', 'Australia', -33.8688, 151.2093),
  city('Auckland', null, 'NZ', 'New Zealand', -36.8509, 174.7645),
  city('Vancouver', 'British Columbia', 'CA', 'Canada', 49.2827, -123.1207),
  city('San Francisco', 'California', 'US', 'United States', 37.7749, -122.4194),
  city('New York', 'New York', 'US', 'United States', 40.7128, -74.006),
  city('Mexico City', null, 'MX', 'Mexico', 19.4326, -99.1332),
  city('Lima', null, 'PE', 'Peru', -12.0464, -77.0428),
  city('Buenos Aires', null, 'AR', 'Argentina', -34.6037, -58.3816),
  city('Rio de Janeiro', null, 'BR', 'Brazil', -22.9068, -43.1729),
  city('Reykjavik', null, 'IS', 'Iceland', 64.1466, -21.9426),
  city('Oslo', null, 'NO', 'Norway', 59.9139, 10.7522),
  city('Athens', null, 'GR', 'Greece', 37.9838, 23.7275),
  city('Kathmandu', null, 'NP', 'Nepal', 27.7172, 85.324),
  city('Colombo', null, 'LK', 'Sri Lanka', 6.9271, 79.8612),
  city('Bali', null, 'ID', 'Indonesia', -8.4095, 115.1889),
  city('Manila', null, 'PH', 'Philippines', 14.5995, 120.9842),
  city('Santiago', null, 'CL', 'Chile', -33.4489, -70.6693),
  city('Havana', null, 'CU', 'Cuba', 23.1136, -82.3666),
];

const NOUNS = [
  'Morning walk',
  'Street food',
  'Old town',
  'Viewpoint',
  'Museum visit',
  'Harbour at dusk',
  'Market stroll',
  'Quiet café',
];

/** A memory of a generated test journey; shaped like the rows the load endpoint writes. */
export type TestStop = {
  id: string;
  placeId: string;
  title: string;
  note: string;
  mood: Mood | null;
  latitude: number;
  longitude: number;
  altitude: number | null;
  visitedAt: number;
  orderIndex: number;
  place: {
    name: string;
    adminArea: string | null;
    countryCode: string;
    countryName: string;
  };
  /** Gets a photo row that reuses an existing demo thumbnail, so photo pins render. */
  withPhoto: boolean;
};

export type TestJourney = {
  id: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  stops: TestStop[];
};

interface TestDataOptions {
  journeys?: number;
  memoriesPer?: number;
  /** Anchors the dates; the newest journey ended before it. */
  now?: number;
  seed?: number;
}

/** Small seeded generator (mulberry32): the same seed always gives the same numbers. */
const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Local-time noon of a calendar day, so the dates read the same in any timezone. */
const noonOf = (time: number): number => {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTime();
};

/**
 * Journeys full of memories for measuring performance: by default 20 journeys of 50 memories (1,000
 * pins) spread over about 40 cities. Deterministic, so a second load finds the same ids and adds nothing.
 */
export const generateTestJourneys = ({
  journeys = 20,
  memoriesPer = 50,
  now = Date.now(),
  seed = 7,
}: TestDataOptions = {}): TestJourney[] => {
  const random = seededRandom(seed);
  const jitter = (): number => (random() - 0.5) * 0.6;

  return Array.from({ length: journeys }, (_, j) => {
    const startDate = noonOf(now - (j + 1) * JOURNEY_SPACING_DAYS * DAY_MS);
    const endDate = startDate + (JOURNEY_LENGTH_DAYS - 1) * DAY_MS;
    // Two cities per journey, so the route has some length.
    const cities = [CITIES[(j * 2) % CITIES.length], CITIES[(j * 2 + 1) % CITIES.length]];
    const journeyId = `${TEST_JOURNEY_PREFIX}${j + 1}`;

    const unordered: TestStop[] = Array.from({ length: memoriesPer }, (_, m) => {
      // First half of the trip in one city, second half in the next: one hop, not a zigzag.
      const base = cities[m < memoriesPer / 2 ? 0 : 1];
      const day = Math.floor((m * JOURNEY_LENGTH_DAYS) / memoriesPer);
      const hour = 8 + Math.floor(random() * 12);
      const mood = random() < 0.2 ? null : MOODS[Math.floor(random() * MOODS.length)];
      return {
        id: `${journeyId}-${m + 1}`,
        placeId: `${TEST_PLACE_PREFIX}${j + 1}-${m + 1}`,
        title: `${NOUNS[Math.floor(random() * NOUNS.length)]} in ${base.name}`,
        note: `Test memory ${m + 1} of ${memoriesPer}.`,
        mood,
        latitude: base.latitude + jitter(),
        longitude: base.longitude + jitter(),
        altitude: m % 4 === 0 ? null : Math.floor(random() * 2500),
        visitedAt: startDate + day * DAY_MS + (hour - 12) * 60 * 60 * 1000,
        orderIndex: m,
        place: {
          name: base.name,
          adminArea: base.adminArea,
          countryCode: base.countryCode,
          countryName: base.countryName,
        },
        withPhoto: m % PHOTO_EVERY === 0,
      };
    });

    // Route order follows time, as a real journey's does.
    const stops = [...unordered]
      .sort((a, b) => a.visitedAt - b.visitedAt)
      .map((stop, orderIndex) => ({ ...stop, orderIndex }));

    return {
      id: journeyId,
      title: `Test trip ${j + 1}: ${cities[0].name} and ${cities[1].name}`,
      description: 'Generated for performance checks.',
      startDate,
      endDate,
      stops,
    };
  });
};
