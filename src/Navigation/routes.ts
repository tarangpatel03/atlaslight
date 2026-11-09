/** Screen names. Every navigator, `navigate()` call and param list takes them from here. */
export const SCREENS = {
  /** The tab navigator (phone tab bar / tablet rail). */
  Main: 'Main',
  Map: 'Map',
  Journeys: 'Journeys',
  Stats: 'Stats',
  Settings: 'Settings',
  /** One journey: cover, stats, route map slot and the timeline of its memories. */
  JourneyDetail: 'JourneyDetail',
  /** New journey (no id) or edit journey (with `journeyId`): a full screen on phones, a dialog on wider windows. */
  JourneyForm: 'JourneyForm',
  /** One memory: a pager of its photos and videos, its place and note. A full screen on phones, a right-hand panel on wider windows. */
  MemoryDetail: 'MemoryDetail',
  /** New memory (no stop id) or edit memory (with `stopId`): a full screen on phones, a dialog on wider windows. */
  MemoryForm: 'MemoryForm',
  /** Dev-only component gallery; registered only in `__DEV__`. */
  Kit: 'Kit',
} as const;
