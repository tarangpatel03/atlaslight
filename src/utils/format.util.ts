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

/** `1 memory`, `6 memories`. */
export const formatCount = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;
