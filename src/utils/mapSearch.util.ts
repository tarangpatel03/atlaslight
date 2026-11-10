type SearchableStop = { id: string; title: string; journeyId: string; journeyTitle: string };

export type LocalSearchResults<T extends SearchableStop> = {
  memories: T[];
  journeys: { id: string; title: string }[];
};

/** Most results shown per group, so the list stays short over the map. */
const MAX_PER_GROUP = 4;

const rankOf = (title: string, needle: string): number =>
  title.toLowerCase().startsWith(needle) ? 0 : 1;

/**
 * Memories and journeys whose title contains the text (case-insensitive), titles that start with
 * it first. Journeys come from the stops, so a journey with no memories is not on the map anyway.
 */
export const searchLocal = <T extends SearchableStop>(
  stops: T[],
  text: string,
): LocalSearchResults<T> => {
  const needle = text.trim().toLowerCase();
  if (!needle) return { memories: [], journeys: [] };

  const byRank = <U extends { title: string }>(items: U[]): U[] =>
    items
      .map((item, index) => ({ item, index }))
      .sort(
        (a, b) => rankOf(a.item.title, needle) - rankOf(b.item.title, needle) || a.index - b.index,
      )
      .map(({ item }) => item);

  const memories = byRank(stops.filter((stop) => stop.title.toLowerCase().includes(needle)));

  const seen = new Map<string, string>();
  for (const stop of stops) {
    if (!seen.has(stop.journeyId) && stop.journeyTitle.toLowerCase().includes(needle)) {
      seen.set(stop.journeyId, stop.journeyTitle);
    }
  }
  const journeys = byRank([...seen].map(([id, title]) => ({ id, title })));

  return { memories: memories.slice(0, MAX_PER_GROUP), journeys: journeys.slice(0, MAX_PER_GROUP) };
};
