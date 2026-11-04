import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { createdAt, id } from '../columns';
import { stops } from './stops';

export const MEDIA_TYPES = ['photo', 'video'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const media = sqliteTable(
  'media',
  {
    id: id(),
    stopId: text('stop_id')
      .notNull()
      .references(() => stops.id, { onDelete: 'cascade' }),
    type: text('type', { enum: MEDIA_TYPES }).notNull(),
    // Paths are RELATIVE to the app documents directory, e.g. "media/<journeyId>/<mediaId>.jpg",
    // so a restored backup works on any device.
    filePath: text('file_path').notNull(),
    thumbnailPath: text('thumbnail_path'),
    width: integer('width'),
    height: integer('height'),
    // Videos only
    durationMs: integer('duration_ms'),
    // From EXIF when available
    takenAt: integer('taken_at'),
    latitude: real('latitude'),
    longitude: real('longitude'),
    // Camera-roll asset ID; prevents importing the same photo twice
    sourceAssetId: text('source_asset_id'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: createdAt(),
  },
  table => [
    index('media_stop_idx').on(table.stopId, table.sortOrder),
    uniqueIndex('media_source_asset_uq').on(table.sourceAssetId),
  ],
);

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
