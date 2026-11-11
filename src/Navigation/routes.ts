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
  /** Full screen map with a fixed centre mark: pan the map, then use that spot as a memory's location. */
  MapPick: 'MapPick',
  /** Places to visit: add a place, remove one. A full screen on phones, a right-hand panel on wider windows. */
  Wishlist: 'Wishlist',
  /** Dev-only component gallery; registered only in `__DEV__`. */
  Kit: 'Kit',
} as const;
