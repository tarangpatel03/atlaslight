import { formatCount, formatDate, formatDateRange } from './format.util';

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
