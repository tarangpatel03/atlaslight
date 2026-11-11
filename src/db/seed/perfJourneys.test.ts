import { cleanAltitude } from '@/utils/geo.util';
import { journeySchema, memorySchema } from '@/utils/validation.util';

import { generateTestJourneys } from './perfJourneys';

// A fixed "today" so the dates are the same in any run.
const NOW = new Date(2026, 10, 9, 12).getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

describe('generateTestJourneys', () => {
  const journeys = generateTestJourneys({ now: NOW });
  const stops = journeys.flatMap((journey) => journey.stops);

  it('makes 20 journeys with 1,000 memories in all', () => {
    expect(journeys).toHaveLength(20);
    expect(stops).toHaveLength(1000);
  });

  it('gives every journey, memory and place a unique id', () => {
    expect(new Set(journeys.map((j) => j.id)).size).toBe(journeys.length);
    expect(new Set(stops.map((s) => s.id)).size).toBe(stops.length);
    expect(new Set(stops.map((s) => s.placeId)).size).toBe(stops.length);
  });

  it('is the same for the same seed and differs for another', () => {
    expect(generateTestJourneys({ now: NOW })).toEqual(journeys);
    expect(generateTestJourneys({ now: NOW, seed: 8 })).not.toEqual(journeys);
  });

  it('keeps coordinates and altitudes in range', () => {
    for (const s of stops) {
      expect(s.latitude).toBeGreaterThanOrEqual(-90);
      expect(s.latitude).toBeLessThanOrEqual(90);
      expect(s.longitude).toBeGreaterThanOrEqual(-180);
      expect(s.longitude).toBeLessThanOrEqual(180);
      if (s.altitude !== null) expect(cleanAltitude(s.altitude)).toBe(s.altitude);
    }
  });

  it('puts every memory inside its journey, in route order, with the journey in the past', () => {
    for (const journey of journeys) {
      expect(journey.endDate).toBeLessThan(NOW);
      const times = journey.stops.map((s) => s.visitedAt);
      expect(journey.stops.map((s) => s.orderIndex)).toEqual(times.map((_, i) => i));
      expect(times).toEqual([...times].sort((a, b) => a - b));
      for (const time of times) {
        expect(time).toBeGreaterThanOrEqual(journey.startDate - DAY_MS / 2);
        expect(time).toBeLessThanOrEqual(journey.endDate + DAY_MS / 2);
      }
    }
  });

  it('passes the journey and memory rules', () => {
    for (const journey of journeys) {
      expect(
        journeySchema.safeParse({
          title: journey.title,
          description: journey.description,
          startDate: journey.startDate,
          endDate: journey.endDate,
        }).success,
      ).toBe(true);
    }
    for (const s of stops) {
      expect(
        memorySchema.safeParse({
          title: s.title,
          note: s.note,
          mood: s.mood,
          latitude: s.latitude,
          longitude: s.longitude,
          altitude: s.altitude,
          visitedAt: s.visitedAt,
          mediaCount: s.withPhoto ? 1 : 0,
        }).success,
      ).toBe(true);
    }
  });

  it('puts a photo on some memories but not all', () => {
    const withPhoto = stops.filter((s) => s.withPhoto).length;
    expect(withPhoto).toBeGreaterThan(0);
    expect(withPhoto).toBeLessThan(stops.length / 2);
  });

  it('honours the counts it is given', () => {
    const small = generateTestJourneys({ journeys: 2, memoriesPer: 3, now: NOW });
    expect(small.map((j) => j.stops.length)).toEqual([3, 3]);
  });
});
