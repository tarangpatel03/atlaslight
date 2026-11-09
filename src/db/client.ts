import { open, type Scalar } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';

import * as schema from '@/db/schema';

const DB_NAME = 'journeys.db';

export const sqlite = open({ name: DB_NAME });

/**
 * op-sqlite 19 returns `{ rawRows, ... }` from `executeRaw`, but drizzle-orm 0.45 expects the rows array.
 * Without this, Drizzle's migration check and every select read nothing (migrations rerun on each launch).
 * Remove once Drizzle supports op-sqlite 19.
 */
const executeRawAsync = async (query: string, params?: Scalar[]): Promise<Scalar[][]> =>
  (await sqlite.executeRaw(query, params)).rawRows;

export const db = drizzle({ ...sqlite, executeRawAsync }, { schema });

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
