import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';

import * as schema from '@/db/schema';

const DB_NAME = 'journeys.db';

export const sqlite = open({ name: DB_NAME });

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;

/**
 * Connection-level settings. Must run before migrations and any query.
 * - foreign_keys: SQLite has FKs OFF by default; without this, cascade deletes do nothing.
 * - WAL: faster writes and reads that don't block while a write is in progress.
 */
export const configureDatabase = async (): Promise<void> => {
  await sqlite.execute('PRAGMA foreign_keys = ON;');
  await sqlite.execute('PRAGMA journal_mode = WAL;');
};
