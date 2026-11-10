type Dated = { id: string; visitedAt: number };

/**
 * The memory to show for "On this day": one from today's month and day in an earlier year, in the
 * device's local time. The most recent year wins, and within a year the earliest time of day.
 * Null when nothing matches. A 29 Feb memory only matches on 29 Feb.
 */
export const findOnThisDay = <T extends Dated>(stops: T[], now: number = Date.now()): T | null => {
  const today = new Date(now);
  let best: T | null = null;
  let bestTime = 0;

  for (const stop of stops) {
    const date = new Date(stop.visitedAt);
    if (date.getFullYear() >= today.getFullYear()) continue;
    if (date.getMonth() !== today.getMonth() || date.getDate() !== today.getDate()) continue;

    const better =
      best === null ||
      date.getFullYear() > new Date(bestTime).getFullYear() ||
      (date.getFullYear() === new Date(bestTime).getFullYear() && stop.visitedAt < bestTime);
    if (better) {
      best = stop;
      bestTime = stop.visitedAt;
    }
  }
  return best;
};
