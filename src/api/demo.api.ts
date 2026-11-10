import { and, eq, inArray, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
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

export const demoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
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

export const { useLoadDemoJourneysMutation } = demoApi;
