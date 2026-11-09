import { differenceInCalendarDays } from 'date-fns';

import { JOURNEY_COLORS, type JourneyColor } from '@/theme/colors';
import { formatCount } from '@/utils/format.util';
import type { JourneyFormValues } from '@/utils/validation.util';

type Dated = { startDate: number; endDate: number | null };

export type YearGroup<T> = { year: number; items: T[] };

/** Groups journeys by start year, newest year first and newest journey first inside a year. */
export const groupJourneysByYear = <T extends Dated>(items: T[]): YearGroup<T>[] => {
  const groups = new Map<number, T[]>();
  for (const item of [...items].sort((a, b) => b.startDate - a.startDate)) {
    const year = new Date(item.startDate).getFullYear();
    groups.set(year, [...(groups.get(year) ?? []), item]);
  }
  return [...groups.entries()].map(([year, grouped]) => ({ year, items: grouped }));
};

/** The journey still in progress (no end date), if any. The rules allow at most one. */
export const pickOngoing = <T extends Dated>(items: T[]): T | null =>
  items.find(item => item.endDate === null) ?? null;

/** Inclusive number of days of a trip; an ongoing trip counts up to `now`. */
export const tripDays = (startMs: number, endMs: number | null, now: number = Date.now()): number =>
  Math.max(1, differenceInCalendarDays(endMs ?? now, startMs) + 1);

/** Next accent colour: the least-used one in the palette, ties broken by palette order. */
export const nextJourneyColor = (usedColors: string[]): JourneyColor => {
  const uses = (color: string): number => usedColors.filter(used => used === color).length;
  return JOURNEY_COLORS.reduce((best, color) => (uses(color) < uses(best) ? color : best));
};

/** What the Journeys list shows: everything, the ongoing journey, favourites, or one start year. */
export type JourneyFilter = 'all' | 'ongoing' | 'favourites' | number;

type Listed = Dated & { id: string; isFavorite: boolean };

/** Distinct start years, newest first (one filter chip each). */
export const journeyYears = (items: Dated[]): number[] =>
  [...new Set(items.map(item => new Date(item.startDate).getFullYear()))].sort((a, b) => b - a);

export const filterJourneys = <T extends Listed>(items: T[], filter: JourneyFilter): T[] => {
  if (filter === 'all') return items;
  if (filter === 'ongoing') return items.filter(item => item.endDate === null);
  if (filter === 'favourites') return items.filter(item => item.isFavorite);
  return items.filter(item => new Date(item.startDate).getFullYear() === filter);
};

/** `7 journeys · since 2024`; empty when there are none. */
export const journeysCaption = (items: Dated[]): string => {
  if (items.length === 0) return '';
  const since = Math.min(...items.map(item => new Date(item.startDate).getFullYear()));
  return `${formatCount(items.length, 'journey', 'journeys')} · since ${since}`;
};

export type JourneyListRow<T> =
  | { kind: 'header'; key: string; label: string; count: number | null }
  | { kind: 'hero'; key: string; journey: T }
  | { kind: 'row'; key: string; journey: T };

/** Flat rows for the list: the ongoing journey as a hero, then the rest under one header per year. */
export const buildJourneyListRows = <T extends Listed>(items: T[]): JourneyListRow<T>[] => {
  const ongoing = pickOngoing(items);
  const rows: JourneyListRow<T>[] = [];
  if (ongoing) {
    rows.push({ kind: 'header', key: 'header-ongoing', label: 'Ongoing', count: null });
    rows.push({ kind: 'hero', key: `hero-${ongoing.id}`, journey: ongoing });
  }
  for (const group of groupJourneysByYear(items.filter(item => item !== ongoing))) {
    rows.push({ kind: 'header', key: `header-${group.year}`, label: String(group.year), count: group.items.length });
    for (const journey of group.items) rows.push({ kind: 'row', key: `row-${journey.id}`, journey });
  }
  return rows;
};

/** Order for the card grid: the ongoing journey first, then newest start date first. */
export const orderJourneysForGrid = <T extends Dated>(items: T[]): T[] => {
  const ongoing = pickOngoing(items);
  const rest = items.filter(item => item !== ongoing).sort((a, b) => b.startDate - a.startDate);
  return ongoing ? [ongoing, ...rest] : rest;
};

/** Local-noon timestamp of the day `ms` falls on: journey dates are whole days, kept at noon like the seed. */
export const noonOf = (ms: number): number => {
  const date = new Date(ms);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTime();
};

/** What the create and update calls take from the validated form: a blank description becomes null. */
export const toJourneyInput = (
  values: JourneyFormValues,
): { title: string; description: string | null; startDate: number; endDate: number | null } => ({
  title: values.title,
  description: values.description ? values.description : null,
  startDate: values.startDate,
  endDate: values.endDate,
});

/** `Deletes 9 memories and 214 photos from this phone.`; videos are listed only when there are some. */
export const formatDeletionSummary = (counts: {
  stopCount: number;
  photoCount: number;
  videoCount: number;
}): string => {
  const parts = [
    formatCount(counts.stopCount, 'memory', 'memories'),
    formatCount(counts.photoCount, 'photo', 'photos'),
  ];
  if (counts.videoCount > 0) parts.push(formatCount(counts.videoCount, 'video', 'videos'));
  const last = parts[parts.length - 1];
  const list = parts.length === 1 ? last : `${parts.slice(0, -1).join(', ')} and ${last}`;
  return `Deletes ${list} from this phone.`;
};
