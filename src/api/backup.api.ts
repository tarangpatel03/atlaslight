import { eq } from 'drizzle-orm';
import { baseApi, runDb } from '@/api/baseApi';
import { db } from '@/db/client';
import { journeys, media, places, stops, wishlist } from '@/db/schema';
import { readStagedData, swapMediaIn, type MediaSwap } from '@/services/backupRestore.service';
import type { BackupData } from '@/utils/backup.util';

/** Rows per insert; the media table has 14 columns and SQLite allows 999 variables per statement in older builds. */
const INSERT_CHUNK = 50;

export const backupApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Every row of the journal, for an export. Read on demand, so nothing is kept in the cache. */
    getBackupData: build.query<BackupData, void>({
      queryFn: () =>
        runDb(async () => {
          const [journeyRows, stopRows, mediaRows, placeRows, wishlistRows] = await Promise.all([
            db.select().from(journeys),
            db.select().from(stops),
            db.select().from(media),
            db.select().from(places),
            db.select().from(wishlist),
          ]);
          return {
            journeys: journeyRows,
            stops: stopRows,
            media: mediaRows,
            places: placeRows,
            wishlist: wishlistRows,
          };
        }),
      keepUnusedDataFor: 0,
    }),

    /**
     * Replaces the whole journal with the backup prepared by `stageBackup`. One transaction deletes
     * every row and inserts the backup's, and the media folders are swapped in just before it commits.
     * If anything fails, the transaction rolls back and the swap is undone, so nothing has changed.
     */
    restoreBackup: build.mutation<null, void>({
      queryFn: () =>
        runDb(async () => {
          const data = await readStagedData();
          const swap: { current: MediaSwap | null } = { current: null };
          try {
            await db.transaction(async (tx) => {
              await tx.delete(wishlist);
              await tx.delete(media);
              await tx.delete(stops);
              await tx.delete(journeys);
              await tx.delete(places);

              // Journeys and media point at each other, so covers are set after the media exists.
              for (let i = 0; i < data.places.length; i += INSERT_CHUNK) {
                await tx.insert(places).values(data.places.slice(i, i + INSERT_CHUNK));
              }
              for (let i = 0; i < data.journeys.length; i += INSERT_CHUNK) {
                const chunk = data.journeys.slice(i, i + INSERT_CHUNK);
                await tx
                  .insert(journeys)
                  .values(chunk.map((row) => ({ ...row, coverMediaId: null })));
              }
              for (let i = 0; i < data.stops.length; i += INSERT_CHUNK) {
                await tx.insert(stops).values(data.stops.slice(i, i + INSERT_CHUNK));
              }
              for (let i = 0; i < data.media.length; i += INSERT_CHUNK) {
                await tx.insert(media).values(data.media.slice(i, i + INSERT_CHUNK));
              }
              for (let i = 0; i < data.wishlist.length; i += INSERT_CHUNK) {
                await tx.insert(wishlist).values(data.wishlist.slice(i, i + INSERT_CHUNK));
              }
              for (const row of data.journeys) {
                if (row.coverMediaId !== null) {
                  await tx
                    .update(journeys)
                    .set({ coverMediaId: row.coverMediaId, updatedAt: row.updatedAt })
                    .where(eq(journeys.id, row.id));
                }
              }

              // Last step before the commit, so the window where files and rows disagree is as short as it can be.
              swap.current = await swapMediaIn();
            });
          } catch (e) {
            await swap.current?.undo();
            throw e;
          }
          await swap.current?.commit();
          return null;
        }),
      // No tags on purpose: the caller resets the whole cache.
    }),
  }),
});

export const { useLazyGetBackupDataQuery, useRestoreBackupMutation } = backupApi;
