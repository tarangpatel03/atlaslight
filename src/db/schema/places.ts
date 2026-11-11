import { index, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createdAt, id } from '../columns';

import { PLACE_SOURCES } from '../enums';

export { PLACE_SOURCES, type PlaceSource } from '../enums';

// Reverse-geocode cache: each location is looked up once, then shared by stops and wishlist.
export const places = sqliteTable(
  'places',
  {
    id: id(),
    name: text('name').notNull(),
    locality: text('locality'),
    // State / province — powers the India scratch map
    adminArea: text('admin_area'),
    // ISO 3166-1 alpha-2, e.g. "IN"
    countryCode: text('country_code'),
    countryName: text('country_name'),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    source: text('source', { enum: PLACE_SOURCES }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index('places_region_idx').on(table.countryCode, table.adminArea),
    index('places_coords_idx').on(table.latitude, table.longitude),
  ],
);

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
