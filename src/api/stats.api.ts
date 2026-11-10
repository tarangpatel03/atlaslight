import { eq, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { journeys, places, stops } from '@/db/schema';
import { resolveRegions, type ResolvedStop, type StatsJourney } from '@/utils/stats.util';
import { baseApi, runDb } from '@/api/baseApi';
import { TAGS } from '@/api/tags';

/** Everything the Stats screen computes from: journeys, and memories with their country and state. */
export type StatsData = { journeys: StatsJourney[]; stops: ResolvedStop[] };

export const statsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Journeys and memories for the stats. Regions are looked up here, once per data change, so
     * switching the year chip only reruns the cheap `computeStats`.
     */
    getStatsData: build.query<StatsData, void>({
      queryFn: () =>
        runDb(async () => {
          const journeyRows = await db
            .select({ id: journeys.id, startDate: journeys.startDate, endDate: journeys.endDate })
            .from(journeys);
          const stopRows = await db
            .select({
              id: stops.id,
              journeyId: stops.journeyId,
              orderIndex: stops.orderIndex,
              visitedAt: stops.visitedAt,
              latitude: stops.latitude,
              longitude: stops.longitude,
              altitude: stops.altitude,
              title: stops.title,
              placeName: places.name,
              // Plain SQL, as in journeys.api.ts: it keeps the `stops.id` correlation intact.
              photoCount:
                sql<number>`(select count(*) from media where media.stop_id = stops.id and media.type = 'photo')`.mapWith(
                  Number,
                ),
            })
            .from(stops)
            .leftJoin(places, eq(places.id, stops.placeId));
          return { journeys: journeyRows, stops: resolveRegions(stopRows) };
        }),
      // Every stop, media, journey and demo write invalidates one of these. Reordering memories
      // invalidates only the journey list, and it changes distance, so both tags are provided.
      providesTags: [TAGS.Stats, { type: TAGS.Journey, id: 'LIST' }],
    }),
  }),
});

export const { useGetStatsDataQuery } = statsApi;
