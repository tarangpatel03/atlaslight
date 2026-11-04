/** RTK Query cache tag names. Always use these; never write the strings inline. */
export const TAGS = {
  Journey: 'Journey',
  Stop: 'Stop',
  Media: 'Media',
  Place: 'Place',
  Wishlist: 'Wishlist',
  Stats: 'Stats',
} as const;

export const TAG_TYPES = Object.values(TAGS);
