import { count, eq } from 'drizzle-orm';
import { baseApi, runDb } from '@/api/baseApi';
import { TAGS } from '@/api/tags';
import { db } from '@/db/client';
import { journeys, media, places, stops, wishlist } from '@/db/schema';
import { deleteAllMediaFiles } from '@/services/mediaStorage.service';

/** How much the journal holds, for the Delete all confirmation. */
export interface DataCounts {
  journeyCount: number;
  stopCount: number;
  photoCount: number;
  videoCount: number;
}

export const dataApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDataCounts: build.query<DataCounts, void>({
      queryFn: () =>
        runDb(async () => {
          const [journeyRows, stopRows, photoRows, videoRows] = await Promise.all([
            db.select({ n: count() }).from(journeys),
            db.select({ n: count() }).from(stops),
            db.select({ n: count() }).from(media).where(eq(media.type, 'photo')),
            db.select({ n: count() }).from(media).where(eq(media.type, 'video')),
          ]);
          return {
            journeyCount: journeyRows[0]?.n ?? 0,
            stopCount: stopRows[0]?.n ?? 0,
            photoCount: photoRows[0]?.n ?? 0,
            videoCount: videoRows[0]?.n ?? 0,
          };
        }),
      providesTags: [{ type: TAGS.Journey, id: 'LIST' }, TAGS.Stop, TAGS.Media],
    }),

    /** Empties the journal: every row first, then the media files. Settings are not touched. */
    deleteAllData: build.mutation<null, void>({
      queryFn: () =>
        runDb(async () => {
          await db.transaction(async (tx) => {
            await tx.delete(wishlist);
            await tx.delete(media);
            await tx.delete(stops);
            await tx.delete(journeys);
            await tx.delete(places);
          });
          // After the commit, so a failed delete leaves the files its rows still point to.
          await deleteAllMediaFiles();
          return null;
        }),
      // No tags on purpose: the caller resets the whole cache, so no screen refetches a row that is gone.
    }),
  }),
});

export const { useGetDataCountsQuery, useDeleteAllDataMutation } = dataApi;
