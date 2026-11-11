import { differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarYears } from 'date-fns';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const FULL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** `Mar 2026`, or `March 2026` with `'long'`, in the device's local time. */
export const formatMonthYear = (ms: number, style: 'long' | 'short' = 'short'): string => {
  const date = new Date(ms);
  const months = style === 'long' ? FULL_MONTHS : MONTHS;
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

/** `31% of the way around the Earth`, or `2.3 times around the Earth` from one lap up. */
export const formatEarthProgress = (fraction: number): string =>
  fraction < 1
    ? `${Math.round(fraction * 100)}% of the way around the Earth`
    : `${fraction.toFixed(1)} times around the Earth`;

/** `13 Mar 2026`, in the device's local time. */
export const formatDate = (ms: number): string => {
  const date = new Date(ms);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Trip dates: `12–15 Mar 2026`, `28 Feb – 3 Mar 2026`, `28 Dec 2025 – 3 Jan 2026`.
 * A single day is `12 Mar 2026`; a journey with no end date is `Since 12 Mar 2026`.
 */
export const formatDateRange = (startMs: number, endMs: number | null): string => {
  if (endMs === null) return `Since ${formatDate(startMs)}`;

  const start = new Date(startMs);
  const end = new Date(endMs);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth && start.getDate() === end.getDate()) return formatDate(startMs);
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
  }
  if (sameYear) {
    const from = `${start.getDate()} ${MONTHS[start.getMonth()]}`;
    const to = `${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    return `${from} – ${to}`;
  }
  return `${formatDate(startMs)} – ${formatDate(endMs)}`;
};

/** `’26`: a year on a chart axis, where four digits would crowd the bars. */
export const formatShortYear = (year: number): string =>
  `’${String(year % 100).padStart(2, '0')}`;

/** `7 journeys`, `7 journeys and 31 memories`, `7 journeys, 31 memories and 32 photos`; the parts must not be empty. */
export const formatList = (parts: string[]): string => {
  const last = parts[parts.length - 1];
  return parts.length === 1 ? last : `${parts.slice(0, -1).join(', ')} and ${last}`;
};

/** `1 memory`, `6 memories`. */
export const formatCount = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

/** `Today`, `Yesterday`, `5 days ago`, `3 months ago`, `2 years ago`, relative to `now`. */
export const formatRelativeDay = (ms: number, now: number = Date.now()): string => {
  const days = differenceInCalendarDays(now, ms);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = differenceInCalendarMonths(now, ms);
  if (months < 12) return `${formatCount(months, 'month', 'months')} ago`;
  return `${formatCount(differenceInCalendarYears(now, ms), 'year', 'years')} ago`;
};

/** `11:30 pm`, in the device's local time. */
export const formatTime = (ms: number): string => {
  const date = new Date(ms);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${hours < 12 ? 'am' : 'pm'}`;
};

/** `6 Jun · 11:30 pm`: a memory's moment without the year. */
export const formatShortDateTime = (ms: number): string => {
  const date = new Date(ms);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} · ${formatTime(ms)}`;
};

/** `0 B`, `842 KB`, `12.4 MB` or `1.2 GB`: whole numbers up to KB, one decimal from MB. */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};
