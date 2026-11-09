/** Screen names. Every navigator, `navigate()` call and param list takes them from here. */
export const SCREENS = {
  /** The tab navigator (phone tab bar / tablet rail). */
  Main: 'Main',
  Map: 'Map',
  Journeys: 'Journeys',
  Stats: 'Stats',
  Settings: 'Settings',
  /** Dev-only component gallery; registered only in `__DEV__`. */
  Kit: 'Kit',
} as const;
