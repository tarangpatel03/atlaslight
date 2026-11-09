import { asc, eq, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { journeys, stops } from '@/db/schema';
import type { MapStop } from '@/utils/mapFeatures.util';
import { baseApi, runDb } from '@/api/baseApi';
import { TAGS } from '@/api/tags';

/** A stop as the map draws it, with the journey facts the chips filter on. */
export type MapStopItem = MapStop & {
  journeyTitle: string;
  isFavorite: boolean;
  /** The journey has no end date. */
  isOngoing: boolean;
};

export const mapApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Every memory with coordinates, for pins, routes and regions. */
    getMapStops: build.query<MapStopItem[], void>({
      queryFn: () =>
        runDb(async () => {
          const rows = await db
            .select({
              id: stops.id,
              journeyId: stops.journeyId,
              latitude: stops.latitude,
              longitude: stops.longitude,
              title: stops.title,
              visitedAt: stops.visitedAt,
              orderIndex: stops.orderIndex,
              color: journeys.color,
              journeyTitle: journeys.title,
              isFavorite: journeys.isFavorite,
              endDate: journeys.endDate,
              // Plain SQL for the first media of the stop, as in getStopsByJourney.
              coverThumbnailPath: sql<
                string | null
              >`(select thumbnail_path from media where media.stop_id = stops.id order by media.sort_order limit 1)`,
            })
            .from(stops)
            .innerJoin(journeys, eq(journeys.id, stops.journeyId))
            .orderBy(asc(stops.visitedAt));
          return rows.map(({ endDate, ...row }) => ({ ...row, isOngoing: endDate === null }));
        }),
      // Every stop or media change, journey change and the demo load already invalidates the
      // journey list, so this tag keeps the map fresh without a tag of its own.
      providesTags: [{ type: TAGS.Journey, id: 'LIST' }],
    }),
  }),
});

export const { useGetMapStopsQuery } = mapApi;
