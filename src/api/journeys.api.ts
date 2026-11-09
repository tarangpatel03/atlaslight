import { and, asc, desc, eq, getTableColumns, isNull, ne, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { type Journey, type MediaType, type NewJourney, journeys, media, stops } from '@/db/schema';
import { deleteJourneyFolder } from '@/services/mediaStorage.service';
import { routeDistanceKm, type LatLng } from '@/utils/geo.util';
import { nextJourneyColor } from '@/utils/journey.util';
import { baseApi, runDb } from '@/api/baseApi';
import { TAGS } from '@/api/tags';

export type JourneyListItem = Journey & {
  stopCount: number;
  photoCount: number;
  coverThumbnailPath: string | null;
  /** The state or province most of its memories are in. */
  region: string | null;
  /** Great-circle length of the route in km. */
  distanceKm: number;
};

export type JourneyDetail = Journey & {
  stopCount: number;
  photoCount: number;
  videoCount: number;
  firstVisitAt: number | null;
  lastVisitAt: number | null;
  coverThumbnailPath: string | null;
  /** Great-circle length of the route in km. */
  distanceKm: number;
};

/** One photo or video of a journey, for the cover picker. */
export type JourneyMediaItem = { id: string; thumbnailPath: string | null; type: MediaType };

export type CreateJourneyInput = Pick<
  NewJourney,
  'title' | 'description' | 'startDate' | 'endDate'
> & {
  /** Set after the user agreed to end the journey that is still ongoing. */
  endCurrentOngoing?: boolean;
};

export type UpdateJourneyInput = { id: string; endCurrentOngoing?: boolean } & Partial<
  Pick<
    NewJourney,
    'title' | 'description' | 'color' | 'startDate' | 'endDate' | 'isFavorite' | 'coverMediaId'
  >
>;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// These subqueries are plain SQL on purpose: when a select has a single table, Drizzle drops the table
// prefix from interpolated columns, which would turn the `journeys.id` correlation into `id = id`.
const stopCountSql =
  sql<number>`(select count(*) from stops where stops.journey_id = journeys.id)`.mapWith(Number);

const mediaCountSql = (type: 'photo' | 'video'): ReturnType<typeof sql<number>> =>
  sql<number>`(
    select count(*) from media join stops on stops.id = media.stop_id
    where stops.journey_id = journeys.id and media.type = ${type}
  )`.mapWith(Number);

/** The chosen cover, else the first media of the route's first memory. */
const coverThumbnailSql = sql<string | null>`coalesce(
  (select media.thumbnail_path from media where media.id = journeys.cover_media_id),
  (
    select media.thumbnail_path from media join stops on stops.id = media.stop_id
    where stops.journey_id = journeys.id
    order by stops.order_index, media.sort_order limit 1
  )
)`;

/** The admin area (state) that most of the journey's places share. */
const regionSql = sql<string | null>`(
  select places.admin_area from stops join places on places.id = stops.place_id
  where stops.journey_id = journeys.id and places.admin_area is not null
  group by places.admin_area order by count(*) desc limit 1
)`;

const visitSql = (fn: 'min' | 'max'): ReturnType<typeof sql<number | null>> =>
  sql<
    number | null
  >`(select ${sql.raw(fn)}(visited_at) from stops where stops.journey_id = journeys.id)`;

/** Route length per journey id: one read of the route points (all journeys, or just `journeyId`), summed in JS. */
const routeDistances = async (journeyId?: string): Promise<Map<string, number>> => {
  const points = await db
    .select({ journeyId: stops.journeyId, latitude: stops.latitude, longitude: stops.longitude })
    .from(stops)
    .where(journeyId ? eq(stops.journeyId, journeyId) : undefined)
    .orderBy(asc(stops.journeyId), asc(stops.orderIndex));
  const routes = new Map<string, LatLng[]>();
  for (const point of points) {
    routes.set(point.journeyId, [...(routes.get(point.journeyId) ?? []), point]);
  }
  return new Map([...routes].map(([id, route]) => [id, routeDistanceKm(route)]));
};

const ONGOING_ERROR = 'Another journey is still ongoing';

/**
 * At most one journey may be ongoing. Without `endCurrent` this throws if another one is;
 * with it, the other journey ends on `startDate` (never before its own start).
 */
const endOtherOngoing = async (
  tx: Tx,
  selfId: string | null,
  startDate: number,
  endCurrent: boolean,
): Promise<void> => {
  const others = await tx
    .select({ id: journeys.id, startDate: journeys.startDate })
    .from(journeys)
    .where(and(isNull(journeys.endDate), selfId ? ne(journeys.id, selfId) : undefined));
  if (others.length === 0) return;
  if (!endCurrent) throw new Error(ONGOING_ERROR);
  for (const other of others) {
    await tx
      .update(journeys)
      .set({ endDate: Math.max(startDate, other.startDate) })
      .where(eq(journeys.id, other.id));
  }
};

export const journeysApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getJourneys: build.query<JourneyListItem[], void>({
      queryFn: () =>
        runDb(async () => {
          const rows = await db
            .select({
              ...getTableColumns(journeys),
              stopCount: stopCountSql,
              photoCount: mediaCountSql('photo'),
              coverThumbnailPath: coverThumbnailSql,
              region: regionSql,
            })
            .from(journeys)
            .orderBy(desc(journeys.startDate));

          const distances = await routeDistances();
          return rows.map((row) => ({ ...row, distanceKm: distances.get(row.id) ?? 0 }));
        }),
      providesTags: (result) => [
        { type: TAGS.Journey, id: 'LIST' },
        ...(result ?? []).map((j) => ({ type: TAGS.Journey, id: j.id })),
      ],
    }),

    getJourney: build.query<JourneyDetail, string>({
      queryFn: (id) =>
        runDb(async () => {
          const [row] = await db
            .select({
              ...getTableColumns(journeys),
              stopCount: stopCountSql,
              photoCount: mediaCountSql('photo'),
              videoCount: mediaCountSql('video'),
              firstVisitAt: visitSql('min'),
              lastVisitAt: visitSql('max'),
              coverThumbnailPath: coverThumbnailSql,
            })
            .from(journeys)
            .where(eq(journeys.id, id));
          if (!row) throw new Error('Journey not found');
          const distances = await routeDistances(id);
          return { ...row, distanceKm: distances.get(id) ?? 0 };
        }),
      providesTags: (_r, _e, id) => [{ type: TAGS.Journey, id }],
    }),

    /** The journey's photos and videos in route order. */
    getJourneyMedia: build.query<JourneyMediaItem[], string>({
      queryFn: (journeyId) =>
        runDb(() =>
          db
            .select({ id: media.id, thumbnailPath: media.thumbnailPath, type: media.type })
            .from(media)
            .innerJoin(stops, eq(stops.id, media.stopId))
            .where(eq(stops.journeyId, journeyId))
            .orderBy(asc(stops.orderIndex), asc(media.sortOrder)),
        ),
      providesTags: (_r, _e, journeyId) => [{ type: TAGS.Journey, id: journeyId }],
    }),

    createJourney: build.mutation<Journey, CreateJourneyInput>({
      queryFn: ({ endCurrentOngoing, ...input }) =>
        runDb(() =>
          db.transaction(async (tx) => {
            if (input.endDate === null) {
              await endOtherOngoing(tx, null, input.startDate, endCurrentOngoing === true);
            }
            const used = await tx.select({ color: journeys.color }).from(journeys);
            const [row] = await tx
              .insert(journeys)
              .values({ ...input, color: nextJourneyColor(used.map((j) => j.color)) })
              .returning();
            return row;
          }),
        ),
      // Ending the other journey changes its detail too, so every Journey entry is refreshed then.
      invalidatesTags: (_r, _e, { endCurrentOngoing }) => [
        endCurrentOngoing ? TAGS.Journey : { type: TAGS.Journey, id: 'LIST' },
        TAGS.Stats,
      ],
    }),

    updateJourney: build.mutation<Journey, UpdateJourneyInput>({
      queryFn: ({ id, endCurrentOngoing, ...changes }) =>
        runDb(() =>
          db.transaction(async (tx) => {
            if (changes.endDate === null) {
              const [current] = await tx
                .select({ startDate: journeys.startDate })
                .from(journeys)
                .where(eq(journeys.id, id));
              if (!current) throw new Error('Journey not found');
              await endOtherOngoing(
                tx,
                id,
                changes.startDate ?? current.startDate,
                endCurrentOngoing === true,
              );
            }
            const [row] = await tx
              .update(journeys)
              .set(changes)
              .where(eq(journeys.id, id))
              .returning();
            if (!row) throw new Error('Journey not found');
            return row;
          }),
        ),
      invalidatesTags: (_r, _e, { id, endCurrentOngoing }) => [
        endCurrentOngoing ? TAGS.Journey : { type: TAGS.Journey, id },
        { type: TAGS.Journey, id: 'LIST' },
        TAGS.Stats,
      ],
    }),

    deleteJourney: build.mutation<{ id: string }, string>({
      queryFn: (id) =>
        runDb(async () => {
          // Stops and media rows are removed by ON DELETE CASCADE; then the files on disk.
          await db.delete(journeys).where(eq(journeys.id, id));
          await deleteJourneyFolder(id);
          return { id };
        }),
      // No `{ Journey, id }` tag on purpose: the screens still open on this journey must not reload a row that is gone.
      invalidatesTags: () => [
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
  useGetJourneyMediaQuery,
  useCreateJourneyMutation,
  useUpdateJourneyMutation,
  useDeleteJourneyMutation,
} = journeysApi;
