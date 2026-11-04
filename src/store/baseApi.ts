import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export type DbError = { message: string };

export const TAG_TYPES = ['Journey', 'Stop', 'Media', 'Place', 'Wishlist', 'Stats'] as const;

/**
 * RTK Query over the local SQLite DB (no HTTP).
 * Each endpoint uses `queryFn` + `runDb`, so we keep caching, loading states
 * and tag-based invalidation without a backend.
 * Features add endpoints with `baseApi.injectEndpoints`.
 */
export const baseApi = createApi({
  reducerPath: 'localDb',
  baseQuery: fakeBaseQuery<DbError>(),
  tagTypes: TAG_TYPES,
  // Local reads are cheap; drop unused cache entries quickly
  keepUnusedDataFor: 30,
  endpoints: () => ({}),
});

/** Wraps a DB call into RTK Query's `{ data } | { error }` shape. */
export async function runDb<T>(fn: () => Promise<T>): Promise<{ data: T } | { error: DbError }> {
  try {
    return { data: await fn() };
  } catch (e) {
    if (__DEV__) console.error('[db]', e);
    return { error: { message: e instanceof Error ? e.message : 'Unknown database error' } };
  }
}
