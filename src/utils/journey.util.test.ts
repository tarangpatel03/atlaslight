import { JOURNEY_COLORS } from '@/theme/colors';

import {
  buildJourneyListRows,
  filterJourneys,
  formatDeleteAllSummary,
  formatDeletionSummary,
  groupJourneysByYear,
  journeysCaption,
  journeyYears,
  nextJourneyColor,
  noonOf,
  orderJourneysForGrid,
  pickOngoing,
  toJourneyInput,
  tripDays,
} from './journey.util';

// Built from local-time parts so the tests pass in any timezone.
const day = (year: number, monthIndex: number, date: number): number =>
  new Date(year, monthIndex, date, 12).getTime();

describe('groupJourneysByYear', () => {
  it('groups by start year, newest first', () => {
    const a = { id: 'a', startDate: day(2024, 5, 1), endDate: day(2024, 5, 9) };
    const b = { id: 'b', startDate: day(2025, 1, 1), endDate: day(2025, 1, 4) };
    const c = { id: 'c', startDate: day(2025, 8, 1), endDate: day(2025, 8, 4) };
    const groups = groupJourneysByYear([a, b, c]);
    expect(groups.map((g) => g.year)).toEqual([2025, 2024]);
    expect(groups[0].items.map((i) => i.id)).toEqual(['c', 'b']);
  });

  it('returns nothing for no journeys', () => {
    expect(groupJourneysByYear([])).toEqual([]);
  });
});

describe('pickOngoing', () => {
  it('finds the journey without an end date', () => {
    const ongoing = { startDate: day(2026, 0, 1), endDate: null };
    const done = { startDate: day(2025, 0, 1), endDate: day(2025, 0, 5) };
    expect(pickOngoing([done, ongoing])).toBe(ongoing);
  });

  it('returns null when every journey has ended', () => {
    expect(pickOngoing([{ startDate: day(2025, 0, 1), endDate: day(2025, 0, 5) }])).toBeNull();
  });
});

describe('tripDays', () => {
  it('counts both the first and the last day', () => {
    expect(tripDays(day(2026, 2, 12), day(2026, 2, 15))).toBe(4);
  });

  it('counts a single day as 1', () => {
    expect(tripDays(day(2026, 2, 12), day(2026, 2, 12))).toBe(1);
  });

  it('counts an ongoing trip up to now', () => {
    expect(tripDays(day(2026, 2, 12), null, day(2026, 2, 14))).toBe(3);
  });
});

describe('nextJourneyColor', () => {
  it('starts with the first palette colour', () => {
    expect(nextJourneyColor([])).toBe(JOURNEY_COLORS[0]);
  });

  it('rotates through the palette', () => {
    expect(nextJourneyColor([JOURNEY_COLORS[0]])).toBe(JOURNEY_COLORS[1]);
  });

  it('picks the least-used colour once all are taken', () => {
    const used = [...JOURNEY_COLORS, ...JOURNEY_COLORS.slice(1)];
    expect(nextJourneyColor(used)).toBe(JOURNEY_COLORS[0]);
  });
});

const journey = (id: string, startDate: number, endDate: number | null, isFavorite = false) => ({
  id,
  startDate,
  endDate,
  isFavorite,
});

const sample = [
  journey('live', day(2026, 10, 3), null),
  journey('a', day(2026, 1, 10), day(2026, 1, 15), true),
  journey('b', day(2025, 5, 12), day(2025, 5, 20)),
  journey('c', day(2025, 11, 5), day(2025, 11, 7), true),
  journey('d', day(2024, 6, 5), day(2024, 6, 9)),
];

describe('journeyYears', () => {
  it('lists each start year once, newest first', () => {
    expect(journeyYears(sample)).toEqual([2026, 2025, 2024]);
  });
});

describe('filterJourneys', () => {
  it('keeps everything for all', () => {
    expect(filterJourneys(sample, 'all')).toHaveLength(5);
  });

  it('keeps only the ongoing journey', () => {
    expect(filterJourneys(sample, 'ongoing').map((j) => j.id)).toEqual(['live']);
  });

  it('keeps favourites', () => {
    expect(filterJourneys(sample, 'favourites').map((j) => j.id)).toEqual(['a', 'c']);
  });

  it('keeps one start year', () => {
    expect(filterJourneys(sample, 2025).map((j) => j.id)).toEqual(['b', 'c']);
  });

  it('can end up empty', () => {
    expect(filterJourneys(sample, 2019)).toEqual([]);
  });
});

describe('journeysCaption', () => {
  it('counts journeys and names the first year', () => {
    expect(journeysCaption(sample)).toBe('5 journeys · since 2024');
  });

  it('uses the singular for one', () => {
    expect(journeysCaption([sample[1]])).toBe('1 journey · since 2026');
  });

  it('is empty for none', () => {
    expect(journeysCaption([])).toBe('');
  });
});

describe('buildJourneyListRows', () => {
  it('puts the ongoing journey first as a hero, then rows under year headers', () => {
    const rows = buildJourneyListRows(sample);
    expect(rows.map((r) => r.key)).toEqual([
      'header-ongoing',
      'hero-live',
      'header-2026',
      'row-a',
      'header-2025',
      'row-c',
      'row-b',
      'header-2024',
      'row-d',
    ]);
  });

  it('counts the journeys under each year header', () => {
    const header = buildJourneyListRows(sample).find((r) => r.key === 'header-2025');
    expect(header).toMatchObject({ label: '2025', count: 2 });
  });

  it('has no Ongoing section without an ongoing journey', () => {
    const rows = buildJourneyListRows(sample.slice(1));
    expect(rows[0].key).toBe('header-2026');
  });

  it('is empty for no journeys', () => {
    expect(buildJourneyListRows([])).toEqual([]);
  });
});

describe('orderJourneysForGrid', () => {
  it('puts the ongoing journey first, then newest first', () => {
    const shuffled = [sample[3], sample[1], sample[0], sample[4], sample[2]];
    expect(orderJourneysForGrid(shuffled).map((j) => j.id)).toEqual(['live', 'a', 'c', 'b', 'd']);
  });

  it('keeps plain newest-first order without an ongoing journey', () => {
    expect(orderJourneysForGrid(sample.slice(1)).map((j) => j.id)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('does not change the list it is given', () => {
    const input = [sample[4], sample[1]];
    orderJourneysForGrid(input);
    expect(input.map((j) => j.id)).toEqual(['d', 'a']);
  });
});

describe('noonOf', () => {
  it('moves any time of day to local noon of the same day', () => {
    expect(noonOf(new Date(2026, 2, 12, 23, 59).getTime())).toBe(day(2026, 2, 12));
    expect(noonOf(new Date(2026, 2, 12, 0, 5).getTime())).toBe(day(2026, 2, 12));
  });
});

describe('toJourneyInput', () => {
  it('keeps a description and the dates', () => {
    expect(
      toJourneyInput({ title: 'Goa', description: 'Beaches', startDate: 1, endDate: 2 }),
    ).toEqual({ title: 'Goa', description: 'Beaches', startDate: 1, endDate: 2 });
  });

  it('turns a blank or missing description into null and keeps an ongoing end date', () => {
    expect(
      toJourneyInput({ title: 'Goa', description: '', startDate: 1, endDate: null }).description,
    ).toBeNull();
    expect(toJourneyInput({ title: 'Goa', startDate: 1, endDate: null }).description).toBeNull();
  });
});

describe('formatDeletionSummary', () => {
  it('names memories and photos', () => {
    expect(formatDeletionSummary({ stopCount: 9, photoCount: 214, videoCount: 0 })).toBe(
      'Deletes 9 memories and 214 photos from this phone.',
    );
  });

  it('adds videos only when there are some', () => {
    expect(formatDeletionSummary({ stopCount: 1, photoCount: 1, videoCount: 2 })).toBe(
      'Deletes 1 memory, 1 photo and 2 videos from this phone.',
    );
  });
});

describe('formatDeleteAllSummary', () => {
  it('names journeys, memories and photos and says settings stay', () => {
    expect(
      formatDeleteAllSummary({ journeyCount: 7, stopCount: 31, photoCount: 32, videoCount: 0 }),
    ).toBe(
      'Deletes 7 journeys, 31 memories and 32 photos from this phone. Your settings stay. This cannot be undone.',
    );
  });

  it('adds videos only when there are some', () => {
    expect(
      formatDeleteAllSummary({ journeyCount: 1, stopCount: 2, photoCount: 1, videoCount: 3 }),
    ).toBe(
      'Deletes 1 journey, 2 memories, 1 photo and 3 videos from this phone. Your settings stay. This cannot be undone.',
    );
  });
});
