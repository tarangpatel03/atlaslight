import { integer, text } from 'drizzle-orm/sqlite-core';
import { v4 as uuidv4 } from 'uuid';

// Drizzle's column-builder types are long and change between versions, so `column` lets each
// export keep its inferred type while still being an explicitly typed function.
const column = <T>(build: () => T): (() => T) => build;

/** UUID primary key (not autoincrement) so IDs stay unique when a backup is imported on another device. */
export const id = column(() =>
  text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
);

/** Epoch-millisecond timestamp (a number, not a Date) so query results stay serializable in Redux. */
export const createdAt = column(() =>
  integer('created_at')
    .notNull()
    .$defaultFn(() => Date.now()),
);

/** Like `createdAt`, and refreshed on every update. */
export const updatedAt = column(() =>
  integer('updated_at')
    .notNull()
    .$defaultFn(() => Date.now())
    .$onUpdateFn(() => Date.now()),
);
