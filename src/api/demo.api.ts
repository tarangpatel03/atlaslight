import { and, count, eq, inArray, isNotNull, isNull, like } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  TEST_JOURNEY_PREFIX,
  TEST_PLACE_PREFIX,
  generateTestJourneys,
} from '@/db/seed/perfJourneys';
import {
  DEMO_JOURNEYS,
  demoJourneyDates,
  demoStopVisitedAt,
  type DemoJourney,
} from '@/db/seed/demoJourneys';
import { journeys, media, places, stops } from '@/db/schema';
import { materializeDemoPhoto, removeTempFiles } from '@/services/demoAssets.service';
import {
  deleteJourneyFolder,
  importMediaBatch,
  type StoredMedia,
} from '@/services/mediaStorage.service';
import type { PickedMedia } from '@/services/picker.service';
import { nextJourneyColor } from '@/utils/journey.util';
import { baseApi, runDb } from '@/api/baseApi';
import { toMediaRows } from '@/api/stops.api';
import { TAGS } from '@/api/tags';

const journeyIdOf = (demo: DemoJourney): string => `demo-${demo.slug}`;

/**
 * Loads one demo journey: photos first (copied and thumbnailed by the normal import pipeline), then one
 * transaction for the rows. If anything fails the journey's files are removed, so nothing is left half-made.
 */
const seedJourney = async (demo: DemoJourney): Promise<void> => {
  const journeyId = journeyIdOf(demo);
  const { startDate, endDate } = demoJourneyDates(demo);
  const tempPaths: string[] = [];

  try {
    const storedByStop: StoredMedia[][] = [];
    for (const item of demo.stops) {
      const takenAt = demoStopVisitedAt(startDate, item);
      const picked: PickedMedia[] = [];
      for (const key of item.photos) {
        const photo = await materializeDemoPhoto(key, {
          latitude: item.latitude,
          longitude: item.longitude,
          takenAt,
        });
        tempPaths.push(photo.path);
        picked.push(photo);
      }
      storedByStop.push(await importMediaBatch(picked, journeyId));
    }

    await db.transaction(async (tx) => {
      const used = await tx.select({ color: journeys.color }).from(journeys);
      await tx.insert(journeys).values({
        id: journeyId,
        title: demo.title,
        description: demo.description,
        color: nextJourneyColor(used.map((j) => j.color)),
        startDate,
        endDate,
      });

      for (const [index, item] of demo.stops.entries()) {
        const stopId = `${journeyId}-${index + 1}`;
        const placeId = `${journeyId}-place-${index + 1}`;
        await tx.insert(places).values({
          id: placeId,
          name: item.place.name,
          locality: item.place.locality,
          adminArea: item.place.adminArea,
          countryCode: demo.country.code,
          countryName: demo.country.name,
          latitude: item.latitude,
          longitude: item.longitude,
          source: 'manual',
        });
        await tx.insert(stops).values({
          id: stopId,
          journeyId,
          placeId,
          latitude: item.latitude,
          longitude: item.longitude,
          altitude: item.altitude,
          title: item.title,
          note: item.note,
          mood: item.mood,
          visitedAt: demoStopVisitedAt(startDate, item),
          orderIndex: index,
        });
        if (storedByStop[index].length > 0) {
          await tx.insert(media).values(toMediaRows(stopId, storedByStop[index]));
        }
      }
    });
  } catch (e) {
    await deleteJourneyFolder(journeyId);
    throw e;
  } finally {
    await removeTempFiles(tempPaths);
  }
};

/** Demo memories loaded before altitude existed get their height; heights the user already set stay. */
const backfillAltitudes = async (demo: DemoJourney): Promise<void> => {
  const journeyId = journeyIdOf(demo);
  for (const [index, item] of demo.stops.entries()) {
    await db
      .update(stops)
      .set({ altitude: item.altitude })
      .where(and(eq(stops.id, `${journeyId}-${index + 1}`), isNull(stops.altitude)));
  }
};

/** Rows per insert, as in the backup restore (SQLite caps the number of bound values). */
const INSERT_CHUNK = 50;

const inChunks = <T>(rows: T[]): T[][] =>
  Array.from({ length: Math.ceil(rows.length / INSERT_CHUNK) }, (_, i) =>
    rows.slice(i * INSERT_CHUNK, (i + 1) * INSERT_CHUNK),
  );

export const demoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Dev tool: adds generated journeys with 1,000 memories for performance checks. Memories marked for a
     * photo reuse the thumbnails of photos already in the app, so no files are copied. A second run adds nothing.
     */
    loadTestMemories: build.mutation<{ added: number }, void>({
      queryFn: () =>
        runDb(async () => {
          const generated = generateTestJourneys();
          const present = await db
            .select({ id: journeys.id })
            .from(journeys)
            .where(like(journeys.id, `${TEST_JOURNEY_PREFIX}%`));
          const loaded = new Set(present.map((row) => row.id));
          const fresh = generated.filter((journey) => !loaded.has(journey.id));
          if (fresh.length === 0) return { added: 0 };

          const photos = await db
            .select({
              filePath: media.filePath,
              thumbnailPath: media.thumbnailPath,
              width: media.width,
              height: media.height,
            })
            .from(media)
            .where(and(eq(media.type, 'photo'), isNotNull(media.thumbnailPath)))
            .limit(10);

          const used = await db.select({ color: journeys.color }).from(journeys);
          const colors = used.map((j) => j.color);
          const journeyRows = fresh.map((journey) => {
            const color = nextJourneyColor(colors);
            colors.push(color);
            return {
              id: journey.id,
              title: journey.title,
              description: journey.description,
              color,
              startDate: journey.startDate,
              endDate: journey.endDate,
            };
          });
          const stopsOf = fresh.flatMap((journey) =>
            journey.stops.map((item) => ({ journey, item })),
          );
          const placeRows = stopsOf.map(({ item }) => ({
            id: item.placeId,
            name: item.place.name,
            adminArea: item.place.adminArea,
            countryCode: item.place.countryCode,
            countryName: item.place.countryName,
            latitude: item.latitude,
            longitude: item.longitude,
            source: 'manual' as const,
          }));
          const stopRows = stopsOf.map(({ journey, item }) => ({
            id: item.id,
            journeyId: journey.id,
            placeId: item.placeId,
            latitude: item.latitude,
            longitude: item.longitude,
            altitude: item.altitude,
            title: item.title,
            note: item.note,
            mood: item.mood,
            visitedAt: item.visitedAt,
            orderIndex: item.orderIndex,
          }));
          const mediaRows =
            photos.length === 0
              ? []
              : stopsOf
                  .filter(({ item }) => item.withPhoto)
                  .map(({ item }, index) => ({
                    id: `${item.id}-photo`,
                    stopId: item.id,
                    type: 'photo' as const,
                    ...photos[index % photos.length],
                    sortOrder: 0,
                  }));

          await db.transaction(async (tx) => {
            for (const rows of inChunks(journeyRows)) await tx.insert(journeys).values(rows);
            for (const rows of inChunks(placeRows)) await tx.insert(places).values(rows);
            for (const rows of inChunks(stopRows)) await tx.insert(stops).values(rows);
            for (const rows of inChunks(mediaRows)) await tx.insert(media).values(rows);
          });
          return { added: stopRows.length };
        }),
      invalidatesTags: [TAGS.Journey, TAGS.Stop, TAGS.Media, TAGS.Place, TAGS.Stats],
    }),

    /** Dev tool: removes what `loadTestMemories` added (the demo journeys and your own data stay). */
    removeTestMemories: build.mutation<{ removed: number }, void>({
      queryFn: () =>
        runDb(async () => {
          const removed = await db.transaction(async (tx) => {
            const [{ total }] = await tx
              .select({ total: count() })
              .from(stops)
              .where(like(stops.journeyId, `${TEST_JOURNEY_PREFIX}%`));
            // Memories and their photo rows go with the journeys (cascade).
            await tx.delete(journeys).where(like(journeys.id, `${TEST_JOURNEY_PREFIX}%`));
            await tx.delete(places).where(like(places.id, `${TEST_PLACE_PREFIX}%`));
            return total;
          });
          return { removed };
        }),
      invalidatesTags: [TAGS.Journey, TAGS.Stop, TAGS.Media, TAGS.Place, TAGS.Stats],
    }),

    /** Adds the demo journeys that are not there yet; a second run adds nothing. */
    loadDemoJourneys: build.mutation<{ added: number }, void>({
      queryFn: () =>
        runDb(async () => {
          const present = await db
            .select({ id: journeys.id })
            .from(journeys)
            .where(inArray(journeys.id, DEMO_JOURNEYS.map(journeyIdOf)));
          const loaded = new Set(present.map((row) => row.id));

          let added = 0;
          for (const demo of DEMO_JOURNEYS) {
            if (loaded.has(journeyIdOf(demo))) {
              await backfillAltitudes(demo);
              continue;
            }
            await seedJourney(demo);
            added += 1;
          }
          return { added };
        }),
      invalidatesTags: [TAGS.Journey, TAGS.Stop, TAGS.Media, TAGS.Place, TAGS.Stats],
    }),
  }),
});

export const {
  useLoadDemoJourneysMutation,
  useLoadTestMemoriesMutation,
  useRemoveTestMemoriesMutation,
} = demoApi;
