import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createdAt, id } from '../columns';
import { places } from './places';

// Places the user wants to visit (shown as differently colored pins).
export const wishlist = sqliteTable('wishlist', {
  id: id(),
  placeId: text('place_id')
    .notNull()
    .unique()
    .references(() => places.id, { onDelete: 'cascade' }),
  note: text('note'),
  createdAt: createdAt(),
});

export type WishlistItem = typeof wishlist.$inferSelect;
export type NewWishlistItem = typeof wishlist.$inferInsert;
