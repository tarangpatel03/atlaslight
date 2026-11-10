import {
  formatCount,
  formatDate,
  formatEarthProgress,
  formatMonthYear,
  formatDateRange,
  formatRelativeDay,
  formatShortDateTime,
  formatShortYear,
  formatTime,
} from './format.util';

// Built from local-time parts so the tests pass in any timezone.
const day = (year: number, monthIndex: number, date: number): number =>
  new Date(year, monthIndex, date, 12).getTime();

describe('formatDate', () => {
  it('formats day, short month and year', () => {
    expect(formatDate(day(2026, 2, 13))).toBe('13 Mar 2026');
  });
});

describe('formatDateRange', () => {
  it('collapses a range inside one month', () => {
    expect(formatDateRange(day(2026, 2, 12), day(2026, 2, 15))).toBe('12–15 Mar 2026');
  });

  it('shows both months inside one year', () => {
    expect(formatDateRange(day(2026, 1, 28), day(2026, 2, 3))).toBe('28 Feb – 3 Mar 2026');
  });

  it('shows both years across a year boundary', () => {
    expect(formatDateRange(day(2025, 11, 28), day(2026, 0, 3))).toBe('28 Dec 2025 – 3 Jan 2026');
  });

  it('shows a single day once', () => {
    expect(formatDateRange(day(2026, 2, 12), day(2026, 2, 12))).toBe('12 Mar 2026');
  });

  it('marks a journey with no end date as ongoing', () => {
    expect(formatDateRange(day(2026, 2, 12), null)).toBe('Since 12 Mar 2026');
  });
});

describe('formatCount', () => {
  it('uses the singular for one', () => {
    expect(formatCount(1, 'memory', 'memories')).toBe('1 memory');
  });

  it('uses the plural otherwise', () => {
    expect(formatCount(6, 'memory', 'memories')).toBe('6 memories');
    expect(formatCount(0, 'memory', 'memories')).toBe('0 memories');
  });
});

describe('formatRelativeDay', () => {
  const now = day(2026, 10, 9);

  it('says Today and Yesterday', () => {
    expect(formatRelativeDay(day(2026, 10, 9), now)).toBe('Today');
    expect(formatRelativeDay(day(2026, 10, 8), now)).toBe('Yesterday');
  });

  it('counts days under a month', () => {
    expect(formatRelativeDay(day(2026, 10, 2), now)).toBe('7 days ago');
  });

  it('counts months under a year', () => {
    expect(formatRelativeDay(day(2026, 9, 1), now)).toBe('1 month ago');
    expect(formatRelativeDay(day(2026, 3, 1), now)).toBe('7 months ago');
  });

  it('counts years', () => {
    expect(formatRelativeDay(day(2025, 4, 1), now)).toBe('1 year ago');
    expect(formatRelativeDay(day(2024, 10, 9), now)).toBe('2 years ago');
  });
});

describe('formatTime', () => {
  it('uses a 12-hour clock with am and pm', () => {
    expect(formatTime(new Date(2026, 5, 6, 23, 30).getTime())).toBe('11:30 pm');
    expect(formatTime(new Date(2026, 5, 6, 9, 5).getTime())).toBe('9:05 am');
  });

  it('shows midnight and noon as 12', () => {
    expect(formatTime(new Date(2026, 5, 6, 0, 0).getTime())).toBe('12:00 am');
    expect(formatTime(new Date(2026, 5, 6, 12, 0).getTime())).toBe('12:00 pm');
  });
});

describe('formatShortDateTime', () => {
  it('joins day, month and time without the year', () => {
    expect(formatShortDateTime(new Date(2026, 5, 6, 23, 30).getTime())).toBe('6 Jun · 11:30 pm');
  });
});

describe('formatShortYear', () => {
  it('keeps the last two digits behind a typographic apostrophe', () => {
    expect(formatShortYear(2026)).toBe('’26');
    expect(formatShortYear(2009)).toBe('’09');
    expect(formatShortYear(2100)).toBe('’00');
  });
});

describe('formatMonthYear', () => {
  it('shortens the month by default and spells it out on request', () => {
    const ms = new Date(2019, 2, 14, 12).getTime();
    expect(formatMonthYear(ms)).toBe('Mar 2019');
    expect(formatMonthYear(ms, 'long')).toBe('March 2019');
  });
});

describe('formatEarthProgress', () => {
  it('gives a percentage below one lap', () => {
    expect(formatEarthProgress(0)).toBe('0% of the way around the Earth');
    expect(formatEarthProgress(0.3114)).toBe('31% of the way around the Earth');
  });

  it('counts laps from one up', () => {
    expect(formatEarthProgress(1)).toBe('1.0 times around the Earth');
    expect(formatEarthProgress(2.34)).toBe('2.3 times around the Earth');
  });
});
