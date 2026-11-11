/** Kept free of Drizzle imports so pure utils (backup validation) and their Jest tests can use it. */
export const MEDIA_TYPES = ['photo', 'video'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const PLACE_SOURCES = ['photon', 'manual', 'exif'] as const;
export type PlaceSource = (typeof PLACE_SOURCES)[number];
