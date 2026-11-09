import { and, between, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { type Place, type PlaceSource, places } from '@/db/schema';
import { reversePlace, searchPlaces } from '@/services/geocoding.service';
import type { PlaceSuggestion } from '@/utils/photon.util';
import { baseApi, runDb } from '@/api/baseApi';
import { TAGS } from '@/api/tags';

export type ResolvePlaceInput = {
  latitude: number;
  longitude: number;
  /** Where the coordinates came from: a photo's EXIF or a manual pick. */
  source: Extract<PlaceSource, 'exif' | 'manual'>;
};

/** About 55 m: two points this close count as the same place. */
const NEARBY_DEGREES = 0.0005;

const findNearbyPlace = async (
  latitude: number,
  longitude: number,
  name?: string,
): Promise<Place | null> => {
  const [row] = await db
    .select()
    .from(places)
    .where(
      and(
        between(places.latitude, latitude - NEARBY_DEGREES, latitude + NEARBY_DEGREES),
        between(places.longitude, longitude - NEARBY_DEGREES, longitude + NEARBY_DEGREES),
        name ? eq(places.name, name) : undefined,
      ),
    )
    .limit(1);
  return row ?? null;
};

const insertPlace = async (suggestion: PlaceSuggestion, source: PlaceSource): Promise<Place> => {
  const [row] = await db
    .insert(places)
    .values({ ...suggestion, source })
    .returning();
  return row;
};

export const placesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Photon search for the typed text. Nothing is stored until the user picks a result. */
    searchPlaces: build.query<PlaceSuggestion[], string>({
      queryFn: (text, api) => runDb(() => searchPlaces(text, api.signal)),
      keepUnusedDataFor: 60,
    }),

    /** Stores the search result the user picked; reuses a cached place at the same spot. */
    savePlace: build.mutation<Place, PlaceSuggestion>({
      queryFn: (suggestion) =>
        runDb(async () => {
          const cached = await findNearbyPlace(
            suggestion.latitude,
            suggestion.longitude,
            suggestion.name,
          );
          return cached ?? insertPlace(suggestion, 'photon');
        }),
      invalidatesTags: [{ type: TAGS.Place, id: 'LIST' }],
    }),

    /** Name for a point: the cache first, Photon only when the point is new. Null when nothing is there. */
    resolvePlace: build.mutation<Place | null, ResolvePlaceInput>({
      queryFn: ({ latitude, longitude, source }, api) =>
        runDb(async () => {
          const cached = await findNearbyPlace(latitude, longitude);
          if (cached) return cached;
          const found = await reversePlace(latitude, longitude, api.signal);
          if (!found) return null;
          // Stored at the asked-for point, not Photon's, so the next lookup here is a cache hit.
          return insertPlace({ ...found, latitude, longitude }, source);
        }),
      invalidatesTags: [{ type: TAGS.Place, id: 'LIST' }],
    }),
  }),
});

export const {
  useSearchPlacesQuery,
  useLazySearchPlacesQuery,
  useSavePlaceMutation,
  useResolvePlaceMutation,
} = placesApi;
