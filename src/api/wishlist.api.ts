import { and, between, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { places, wishlist } from '@/db/schema';
import { baseApi, runDb } from '@/api/baseApi';
import { TAGS } from '@/api/tags';

/** About 11 km: the same name this close counts as the same place. */
const SAME_PLACE_DEGREES = 0.1;

/** One place on the wishlist, with what the list and the map draw. */
export type WishlistEntry = {
  id: string;
  name: string;
  locality: string | null;
  adminArea: string | null;
  countryName: string | null;
  latitude: number;
  longitude: number;
  addedAt: number;
};

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Every wishlist place, newest first. */
    getWishlist: build.query<WishlistEntry[], void>({
      queryFn: () =>
        runDb(() =>
          db
            .select({
              id: wishlist.id,
              name: places.name,
              locality: places.locality,
              adminArea: places.adminArea,
              countryName: places.countryName,
              latitude: places.latitude,
              longitude: places.longitude,
              addedAt: wishlist.createdAt,
            })
            .from(wishlist)
            .innerJoin(places, eq(places.id, wishlist.placeId))
            .orderBy(desc(wishlist.createdAt)),
        ),
      providesTags: [{ type: TAGS.Wishlist, id: 'LIST' }],
    }),

    /** Puts a saved place on the wishlist. Resolves to false when it was already there. */
    addToWishlist: build.mutation<boolean, { placeId: string }>({
      queryFn: ({ placeId }) =>
        runDb(async () => {
          // Photon can return the same town at a slightly different point each time, which is a new
          // `places` row, so "already listed" also means the same name within about 10 km.
          const [place] = await db.select().from(places).where(eq(places.id, placeId));
          if (place) {
            const [listed] = await db
              .select({ id: wishlist.id })
              .from(wishlist)
              .innerJoin(places, eq(places.id, wishlist.placeId))
              .where(
                and(
                  eq(places.name, place.name),
                  between(
                    places.latitude,
                    place.latitude - SAME_PLACE_DEGREES,
                    place.latitude + SAME_PLACE_DEGREES,
                  ),
                  between(
                    places.longitude,
                    place.longitude - SAME_PLACE_DEGREES,
                    place.longitude + SAME_PLACE_DEGREES,
                  ),
                ),
              )
              .limit(1);
            if (listed) return false;
          }
          const added = await db
            .insert(wishlist)
            .values({ placeId })
            .onConflictDoNothing({ target: wishlist.placeId })
            .returning({ id: wishlist.id });
          return added.length > 0;
        }),
      invalidatesTags: [{ type: TAGS.Wishlist, id: 'LIST' }],
    }),

    /** Takes a place off the wishlist; the cached place stays. */
    removeFromWishlist: build.mutation<{ id: string }, string>({
      queryFn: (id) =>
        runDb(async () => {
          await db.delete(wishlist).where(eq(wishlist.id, id));
          // RTK Query rejects a result whose data is undefined.
          return { id };
        }),
      invalidatesTags: [{ type: TAGS.Wishlist, id: 'LIST' }],
    }),
  }),
});

export const { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } =
  wishlistApi;
