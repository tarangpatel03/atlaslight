import { integer, text } from 'drizzle-orm/sqlite-core';
import { v4 as uuidv4 } from 'uuid';

// UUIDs (not autoincrement) so IDs stay unique when a backup is imported on another device.
export const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4());

// Timestamps are plain epoch milliseconds (numbers), not Date objects,
// so query results stay serializable inside Redux / RTK Query.
export const createdAt = () =>
  integer('created_at')
    .notNull()
    .$defaultFn(() => Date.now());

export const updatedAt = () =>
  integer('updated_at')
    .notNull()
    .$defaultFn(() => Date.now())
    .$onUpdateFn(() => Date.now());
