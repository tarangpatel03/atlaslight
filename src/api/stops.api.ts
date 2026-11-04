import { and, asc, count, eq, getTableColumns, inArray, max, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  type Media,
  type Mood,
  type NewMedia,
  type Place,
  type Stop,
  media,
  places,
  stops,
} from '@/db/schema';
import type { PickedMedia } from '@/services/picker.service';
import { cleanPickerCache } from '@/services/picker.service';
import { deleteMediaFiles, importMediaBatch } from '@/services/mediaStorage.service';
import { baseApi, runDb } from '@/api/baseApi';
import { TAGS } from '@/api/tags';

export type StopListItem = Stop & {
  mediaCount: number;
  coverThumbnailPath: string | null;
};

export type StopDetail = Stop & {
  place: Place | null;
  media: Media[];
};

export type CreateStopInput = {
  journeyId: string;
  title: string;
  note?: string | null;
  mood?: Mood | null;
  visitedAt: number;
  latitude: number;
  longitude: number;
  placeId?: string | null;
  /** First item becomes the cover. */
  media: PickedMedia[];
};

export type UpdateStopInput = { id: string; journeyId: string } & Partial<
  Pick<Stop, 'title' | 'note' | 'mood' | 'visitedAt' | 'latitude' | 'longitude' | 'placeId'>
>;

export type AddMediaInput = { stopId: string; journeyId: string; media: PickedMedia[] };

export type RemoveMediaInput = { stopId: string; journeyId: string; mediaIds: string[] };

export type ReorderStopsInput = { journeyId: string; orderedIds: string[] };

/** Tag for "the stops of one journey". */
const journeyStopsTag = (journeyId: string) => ({ type: TAGS.Stop, id: `journey-${journeyId}` });

/** Everything that shows a stop count, a cover or a stat changes when stops change. */
const stopChangeTags = (journeyId: string) => [
  journeyStopsTag(journeyId),
  { type: TAGS.Journey, id: journeyId },
  { type: TAGS.Journey, id: 'LIST' },
  TAGS.Stats,
];

const toMediaRows = (
  stopId: string,
  stored: Awaited<ReturnType<typeof importMediaBatch>>,
  startOrder = 0,
): NewMedia[] =>
  stored.map((m, i) => ({
    id: m.id,
    stopId,
    type: m.type,
    filePath: m.filePath,
    thumbnailPath: m.thumbnailPath,
    width: m.width,
    height: m.height,
    durationMs: m.durationMs,
    takenAt: m.takenAt,
    latitude: m.latitude,
    longitude: m.longitude,
    sourceAssetId: m.sourceAssetId,
    sortOrder: startOrder + i,
  }));

export const stopsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Timeline of one journey, in route order. */
    getStopsByJourney: build.query<StopListItem[], string>({
      queryFn: (journeyId) =>
        runDb(() =>
          db
            .select({
              ...getTableColumns(stops),
              mediaCount: count(media.id),
              coverThumbnailPath: sql<string | null>`(
                select ${media.thumbnailPath} from ${media}
                where ${media.stopId} = ${stops.id}
                order by ${media.sortOrder} limit 1
              )`,
            })
            .from(stops)
            .leftJoin(media, eq(media.stopId, stops.id))
            .where(eq(stops.journeyId, journeyId))
            .groupBy(stops.id)
            .orderBy(asc(stops.orderIndex)),
        ),
      providesTags: (result, _e, journeyId) => [
        journeyStopsTag(journeyId),
        ...(result ?? []).map((s) => ({ type: TAGS.Stop, id: s.id })),
      ],
    }),

    getStop: build.query<StopDetail, string>({
      queryFn: (id) =>
        runDb(async () => {
          const [row] = await db
            .select({ stop: stops, place: places })
            .from(stops)
            .leftJoin(places, eq(places.id, stops.placeId))
            .where(eq(stops.id, id));
          if (!row) throw new Error('Memory not found');

          const items = await db
            .select()
            .from(media)
            .where(eq(media.stopId, id))
            .orderBy(asc(media.sortOrder));
          return { ...row.stop, place: row.place, media: items };
        }),
      providesTags: (_r, _e, id) => [
        { type: TAGS.Stop, id },
        { type: TAGS.Media, id: `stop-${id}` },
      ],
    }),

    /**
     * Files are copied BEFORE the DB write; if the write fails they're deleted again,
     * so a failed save leaves nothing behind.
     */
    createStop: build.mutation<Stop, CreateStopInput>({
      queryFn: ({ media: picked, ...input }) =>
        runDb(async () => {
          const stored = await importMediaBatch(picked, input.journeyId);
          try {
            const stop = await db.transaction(async (tx) => {
              const [{ next }] = await tx
                .select({ next: max(stops.orderIndex) })
                .from(stops)
                .where(eq(stops.journeyId, input.journeyId));

              const [created] = await tx
                .insert(stops)
                .values({ ...input, orderIndex: (next ?? -1) + 1 })
                .returning();

              if (stored.length > 0) {
                await tx.insert(media).values(toMediaRows(created.id, stored));
              }
              return created;
            });
            await cleanPickerCache();
            return stop;
          } catch (e) {
            await deleteMediaFiles(stored);
            throw e;
          }
        }),
      invalidatesTags: (_r, _e, { journeyId }) => stopChangeTags(journeyId),
    }),

    updateStop: build.mutation<Stop, UpdateStopInput>({
      // Fields are listed one by one so `journeyId` (used only for cache tags) is never written.
      queryFn: ({ id, title, note, mood, visitedAt, latitude, longitude, placeId }) =>
        runDb(async () => {
          const [row] = await db
            .update(stops)
            .set({ title, note, mood, visitedAt, latitude, longitude, placeId })
            .where(eq(stops.id, id))
            .returning();
          if (!row) throw new Error('Memory not found');
          return row;
        }),
      invalidatesTags: (_r, _e, { id, journeyId }) => [
        { type: TAGS.Stop, id },
        ...stopChangeTags(journeyId),
      ],
    }),

    addMediaToStop: build.mutation<Media[], AddMediaInput>({
      queryFn: ({ stopId, journeyId, media: picked }) =>
        runDb(async () => {
          const stored = await importMediaBatch(picked, journeyId);
          try {
            const rows = await db.transaction(async (tx) => {
              const [{ last }] = await tx
                .select({ last: max(media.sortOrder) })
                .from(media)
                .where(eq(media.stopId, stopId));
              return tx
                .insert(media)
                .values(toMediaRows(stopId, stored, (last ?? -1) + 1))
                .returning();
            });
            await cleanPickerCache();
            return rows;
          } catch (e) {
            await deleteMediaFiles(stored);
            throw e;
          }
        }),
      invalidatesTags: (_r, _e, { stopId, journeyId }) => [
        { type: TAGS.Media, id: `stop-${stopId}` },
        ...stopChangeTags(journeyId),
      ],
    }),

    removeMediaFromStop: build.mutation<{ removed: number }, RemoveMediaInput>({
      queryFn: ({ stopId, mediaIds }) =>
        runDb(async () => {
          if (mediaIds.length === 0) return { removed: 0 };
          const removed = await db
            .delete(media)
            .where(and(eq(media.stopId, stopId), inArray(media.id, mediaIds)))
            .returning({ filePath: media.filePath, thumbnailPath: media.thumbnailPath });
          // Rows first, files second: a crash in between leaves orphan files, never broken rows.
          await deleteMediaFiles(removed);
          return { removed: removed.length };
        }),
      invalidatesTags: (_r, _e, { stopId, journeyId }) => [
        { type: TAGS.Media, id: `stop-${stopId}` },
        ...stopChangeTags(journeyId),
      ],
    }),

    deleteStop: build.mutation<{ id: string }, { id: string; journeyId: string }>({
      queryFn: ({ id }) =>
        runDb(async () => {
          const files = await db
            .select({ filePath: media.filePath, thumbnailPath: media.thumbnailPath })
            .from(media)
            .where(eq(media.stopId, id));
          // Media rows go with the stop via ON DELETE CASCADE.
          await db.delete(stops).where(eq(stops.id, id));
          await deleteMediaFiles(files);
          return { id };
        }),
      invalidatesTags: (_r, _e, { id, journeyId }) => [
        { type: TAGS.Stop, id },
        { type: TAGS.Media, id: `stop-${id}` },
        ...stopChangeTags(journeyId),
      ],
    }),

    /** Saves a new route order after a drag-reorder in the timeline. */
    reorderStops: build.mutation<{ count: number }, ReorderStopsInput>({
      queryFn: ({ orderedIds }) =>
        runDb(async () => {
          await db.transaction(async (tx) => {
            for (const [index, id] of orderedIds.entries()) {
              await tx.update(stops).set({ orderIndex: index }).where(eq(stops.id, id));
            }
          });
          return { count: orderedIds.length };
        }),
      invalidatesTags: (_r, _e, { journeyId }) => [{ type: TAGS.Journey, id: journeyId }],
    }),
  }),
});

// Optimistic reorder: the timeline moves instantly and rolls back if the write fails.
// Added via enhanceEndpoints so it can reference stopsApi's own typed cache.
stopsApi.enhanceEndpoints({
  endpoints: {
    reorderStops: {
      async onQueryStarted({ journeyId, orderedIds }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          stopsApi.util.updateQueryData('getStopsByJourney', journeyId, (draft) => {
            const byId = new Map(draft.map((s) => [s.id, s]));
            const next = orderedIds
              .map((id, index) => {
                const stop = byId.get(id);
                return stop ? { ...stop, orderIndex: index } : null;
              })
              .filter((s): s is StopListItem => s !== null);
            draft.splice(0, draft.length, ...next);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    },
  },
});

export const {
  useGetStopsByJourneyQuery,
  useGetStopQuery,
  useCreateStopMutation,
  useUpdateStopMutation,
  useAddMediaToStopMutation,
  useRemoveMediaFromStopMutation,
  useDeleteStopMutation,
  useReorderStopsMutation,
} = stopsApi;
