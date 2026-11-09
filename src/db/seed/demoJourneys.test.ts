import { journeySchema, memorySchema } from '@/utils/validation.util';

import { DEMO_JOURNEYS, demoJourneyDates, demoStopVisitedAt } from './demoJourneys';

// A fixed "today" so the ongoing journey is the same in any run.
const NOW = new Date(2026, 10, 9, 12).getTime();

describe('demo journeys', () => {
  it('have unique slugs', () => {
    const slugs = DEMO_JOURNEYS.map((j) => j.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('seven journeys, exactly one of them ongoing', () => {
    expect(DEMO_JOURNEYS).toHaveLength(7);
    expect(DEMO_JOURNEYS.filter((j) => j.lengthDays === null)).toHaveLength(1);
  });

  it.each(DEMO_JOURNEYS.map((j) => [j.slug, j] as const))(
    '%s passes the journey rules',
    (_slug, journey) => {
      const { startDate, endDate } = demoJourneyDates(journey, NOW);
      expect(
        journeySchema.safeParse({
          title: journey.title,
          description: journey.description,
          startDate,
          endDate,
        }).success,
      ).toBe(true);
      expect(journey.stops.length).toBeGreaterThan(0);
    },
  );

  it.each(DEMO_JOURNEYS.map((j) => [j.slug, j] as const))(
    '%s memories pass the memory rules and fit the trip',
    (_slug, journey) => {
      const { startDate, endDate } = demoJourneyDates(journey, NOW);
      const last = endDate ?? NOW;
      for (const item of journey.stops) {
        const visitedAt = demoStopVisitedAt(startDate, item);
        const result = memorySchema.safeParse({
          title: item.title,
          note: item.note,
          mood: item.mood,
          latitude: item.latitude,
          longitude: item.longitude,
          visitedAt,
          mediaCount: item.photos.length,
        });
        expect(result.success).toBe(true);
        expect(visitedAt).toBeGreaterThanOrEqual(startDate - 12 * 3600 * 1000);
        expect(visitedAt).toBeLessThanOrEqual(last + 12 * 3600 * 1000);
      }
    },
  );

  it('keeps the ongoing journey in the past, started 6 days ago', () => {
    const ongoing = DEMO_JOURNEYS.find((j) => j.lengthDays === null);
    expect(ongoing).toBeDefined();
    if (!ongoing) return;
    const { startDate } = demoJourneyDates(ongoing, NOW);
    expect(Math.round((NOW - startDate) / 86400000)).toBe(6);
    for (const item of ongoing.stops)
      expect(demoStopVisitedAt(startDate, item)).toBeLessThanOrEqual(NOW);
  });

  it('leaves some memories without a photo', () => {
    const withoutPhoto = DEMO_JOURNEYS.flatMap((j) => j.stops).filter((s) => s.photos.length === 0);
    expect(withoutPhoto.length).toBeGreaterThan(0);
  });
});
