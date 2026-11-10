import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createdAt, id, updatedAt } from '../columns';
import { MOODS } from '../moods';
import { journeys } from './journeys';
import { places } from './places';

export { MOODS, type Mood } from '../moods';

// A stop is a single memory at one location within a journey.
export const stops = sqliteTable(
  'stops',
  {
    id: id(),
    journeyId: text('journey_id')
      .notNull()
      .references(() => journeys.id, { onDelete: 'cascade' }),
    placeId: text('place_id').references(() => places.id, { onDelete: 'set null' }),
    // Exact pin position (the place row may be a broader area)
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    // Metres above sea level; null = unknown (feeds the Stats "Highest point")
    altitude: real('altitude'),
    title: text('title').notNull(),
    note: text('note'),
    mood: text('mood', { enum: MOODS }),
    visitedAt: integer('visited_at').notNull(),
    // Route order within the journey
    orderIndex: integer('order_index').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('stops_journey_order_idx').on(table.journeyId, table.orderIndex),
    index('stops_visited_at_idx').on(table.visitedAt),
    index('stops_place_idx').on(table.placeId),
  ],
);

export type Stop = typeof stops.$inferSelect;
export type NewStop = typeof stops.$inferInsert;
