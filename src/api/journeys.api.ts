import { count, desc, eq, getTableColumns, max, min } from 'drizzle-orm';

import { db } from '@/db/client';
import { type Journey, type NewJourney, journeys, media, stops } from '@/db/schema';
import { deleteJourneyFolder } from '@/services/mediaStorage.service';
import { baseApi, runDb } from '@/api/baseApi';
import { TAGS } from '@/api/tags';

export type JourneyListItem = Journey & {
  stopCount: number;
  coverThumbnailPath: string | null;
};

export type JourneyDetail = Journey & {
  stopCount: number;
  firstVisitAt: number | null;
  lastVisitAt: number | null;
};

export type CreateJourneyInput = Pick<NewJourney, 'title' | 'description' | 'color' | 'startDate' | 'endDate'>;

export type UpdateJourneyInput = { id: string } & Partial<
  Pick<NewJourney, 'title' | 'description' | 'color' | 'startDate' | 'endDate' | 'isFavorite' | 'coverMediaId'>
>;

export const journeysApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getJourneys: build.query<JourneyListItem[], void>({
      queryFn: () =>
        runDb(async () => {
          const rows = await db
            .select({
              ...getTableColumns(journeys),
              stopCount: count(stops.id),
              coverThumbnailPath: media.thumbnailPath,
            })
            .from(journeys)
            .leftJoin(stops, eq(stops.journeyId, journeys.id))
            .leftJoin(media, eq(media.id, journeys.coverMediaId))
            .groupBy(journeys.id)
            .orderBy(desc(journeys.startDate));
          return rows;
        }),
      providesTags: result => [
        { type: TAGS.Journey, id: 'LIST' },
        ...(result ?? []).map(j => ({ type: TAGS.Journey, id: j.id })),
      ],
    }),

    getJourney: build.query<JourneyDetail, string>({
      queryFn: id =>
        runDb(async () => {
          const [row] = await db
            .select({
              ...getTableColumns(journeys),
              stopCount: count(stops.id),
              firstVisitAt: min(stops.visitedAt),
              lastVisitAt: max(stops.visitedAt),
            })
            .from(journeys)
            .leftJoin(stops, eq(stops.journeyId, journeys.id))
            .where(eq(journeys.id, id))
            .groupBy(journeys.id);
          if (!row) throw new Error('Journey not found');
          return row;
        }),
      providesTags: (_r, _e, id) => [{ type: TAGS.Journey, id }],
    }),

    createJourney: build.mutation<Journey, CreateJourneyInput>({
      queryFn: input =>
        runDb(async () => {
          const [row] = await db.insert(journeys).values(input).returning();
          return row;
        }),
      invalidatesTags: [{ type: TAGS.Journey, id: 'LIST' }, TAGS.Stats],
    }),

    updateJourney: build.mutation<Journey, UpdateJourneyInput>({
      queryFn: ({ id, ...changes }) =>
        runDb(async () => {
          const [row] = await db.update(journeys).set(changes).where(eq(journeys.id, id)).returning();
          if (!row) throw new Error('Journey not found');
          return row;
        }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: TAGS.Journey, id },
        { type: TAGS.Journey, id: 'LIST' },
      ],
    }),

    deleteJourney: build.mutation<{ id: string }, string>({
      queryFn: id =>
        runDb(async () => {
          // Stops and media rows are removed by ON DELETE CASCADE; then the files on disk.
          await db.delete(journeys).where(eq(journeys.id, id));
          await deleteJourneyFolder(id);
          return { id };
        }),
      invalidatesTags: (_r, _e, id) => [
        { type: TAGS.Journey, id },
        { type: TAGS.Journey, id: 'LIST' },
        TAGS.Stop,
        TAGS.Media,
        TAGS.Stats,
      ],
    }),
  }),
});

export const {
  useGetJourneysQuery,
  useGetJourneyQuery,
  useCreateJourneyMutation,
  useUpdateJourneyMutation,
  useDeleteJourneyMutation,
} = journeysApi;
