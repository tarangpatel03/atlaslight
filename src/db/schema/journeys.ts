import { type AnySQLiteColumn, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createdAt, id, updatedAt } from '../columns';
import { media } from './media';

export const journeys = sqliteTable(
  'journeys',
  {
    id: id(),
    title: text('title').notNull(),
    description: text('description'),
    // Circular FK (media → stops → journeys), so the column type is widened.
    coverMediaId: text('cover_media_id').references((): AnySQLiteColumn => media.id, {
      onDelete: 'set null',
    }),
    color: text('color').notNull(),
    startDate: integer('start_date').notNull(),
    // null = trip is still ongoing
    endDate: integer('end_date'),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  table => [index('journeys_start_date_idx').on(table.startDate)],
);

export type Journey = typeof journeys.$inferSelect;
export type NewJourney = typeof journeys.$inferInsert;
