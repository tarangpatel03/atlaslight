import { findOnThisDay } from './onThisDay.util';

// Local dates, so the tests hold in any time zone.
const at = (year: number, month: number, day: number, hour = 12): number =>
  new Date(year, month - 1, day, hour).getTime();

const stop = (id: string, visitedAt: number): { id: string; visitedAt: number } => ({
  id,
  visitedAt,
});

const NOW = at(2026, 11, 10, 9);

describe('findOnThisDay', () => {
  it('returns null for an empty list', () => {
    expect(findOnThisDay([], NOW)).toBeNull();
  });

  it('finds a memory from the same day in an earlier year', () => {
    const match = stop('a', at(2024, 11, 10));
    expect(findOnThisDay([stop('x', at(2024, 11, 11)), match], NOW)).toBe(match);
  });

  it('ignores the same month on another day', () => {
    expect(
      findOnThisDay([stop('a', at(2024, 11, 9)), stop('b', at(2024, 11, 11))], NOW),
    ).toBeNull();
  });

  it('ignores the same day in other months', () => {
    expect(findOnThisDay([stop('a', at(2024, 10, 10))], NOW)).toBeNull();
  });

  it('ignores today and later years', () => {
    expect(
      findOnThisDay([stop('a', at(2026, 11, 10)), stop('b', at(2027, 11, 10))], NOW),
    ).toBeNull();
  });

  it('prefers the most recent year', () => {
    const recent = stop('recent', at(2025, 11, 10));
    expect(findOnThisDay([stop('old', at(2022, 11, 10)), recent], NOW)).toBe(recent);
  });

  it('takes the earliest time of day within the same year', () => {
    const early = stop('early', at(2025, 11, 10, 8));
    expect(findOnThisDay([stop('late', at(2025, 11, 10, 20)), early], NOW)).toBe(early);
  });

  it('matches 29 Feb only on 29 Feb', () => {
    const leap = stop('leap', at(2024, 2, 29));
    expect(findOnThisDay([leap], at(2028, 2, 29))).toBe(leap);
    expect(findOnThisDay([leap], at(2027, 2, 28))).toBeNull();
    expect(findOnThisDay([leap], at(2027, 3, 1))).toBeNull();
  });
});
