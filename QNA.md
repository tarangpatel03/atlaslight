# Atlaslight: questions and answers

Each answer has two parts. **How it works** describes what Atlaslight does today. **Step-by-step implementation** is the order I would build it in from scratch, with the real file names and code from this repo.

Questions:

1. [How SQLite is used](#1-how-sqlite-is-used)
2. [How media is managed (photos and videos)](#2-how-media-is-managed-photos-and-videos)
3. [How the map works](#3-how-the-map-works)
4. [How backup works](#4-how-backup-and-restore-work)
5. [How location search works](#5-how-location-search-works)
6. [How maps and locations work offline](#6-how-maps-and-locations-work-offline)
7. [How live location works](#7-how-live-location-works)
8. [How stats are calculated](#8-how-stats-are-calculated)
9. [How distance calculation works](#9-how-distance-calculation-works)
10. [How On this day works](#10-how-on-this-day-works)
11. [How the responsive layout works](#11-how-the-responsive-layout-works-tablet-landscape-and-phone-portrait)

---

## 1. How SQLite is used

### How it works

```
Screen ─▶ RTK Query hook ─▶ queryFn + runDb() ─▶ Drizzle ORM ─▶ op-sqlite ─▶ journeys.db (on the device)
```

- **op-sqlite** is the native SQLite driver. It uses JSI, so calls skip the old React Native bridge and are fast.
- **Drizzle ORM** lets me write the schema in TypeScript, generate SQL migrations from it, and write typed queries.
- **RTK Query** sits on top. Even with no server, it gives every screen caching, `isLoading`/`isError`, and automatic refresh through cache tags.
- Screens never touch the database directly; they only call hooks such as `useGetJourneysQuery()`.

### Step-by-step implementation

**Step 1: Install**

```bash
yarn add @op-engineering/op-sqlite drizzle-orm uuid react-native-get-random-values
yarn add -D drizzle-kit babel-plugin-inline-import
```

Then rebuild the native app with `yarn android`.

**Step 2: Let the bundler load `.sql` files.** Drizzle's migrations are plain `.sql` files that get bundled into the app.

- `metro.config.js`: `resolver: { sourceExts: [...defaults, 'sql'] }`
- `babel.config.js`: `['inline-import', { extensions: ['.sql'] }]`
- `drizzle.config.ts`: `{ dialect: 'sqlite', driver: 'expo', schema: './src/db/schema/index.ts', out: './src/db/migrations' }`. The `expo` driver is the one that bundles migrations for on-device SQLite, and it works for op-sqlite too.

**Step 3: Connect (`src/db/client.ts`)**

```ts
export const sqlite = open({ name: 'journeys.db' });

// op-sqlite 19 returns { rawRows }, but Drizzle 0.45 expects an array; without this adapter
// every select read nothing and migrations re-ran on each launch.
const executeRawAsync = async (q: string, p?: Scalar[]) => (await sqlite.executeRaw(q, p)).rawRows;

export const db = drizzle({ ...sqlite, executeRawAsync }, { schema });

export const configureDatabase = async () => {
  await sqlite.execute('PRAGMA foreign_keys = ON;'); // OFF by default, so cascades would do nothing
  await sqlite.execute('PRAGMA journal_mode = WAL;'); // reads don't block during writes
};
```

**Step 4: Shared columns (`src/db/columns.ts`)**

- `id`: a text UUID primary key (`$defaultFn(uuidv4)`). I use UUIDs, not auto-increment numbers, so ids stay unique when a backup is restored on another device.
- `createdAt` and `updatedAt`: epoch milliseconds stored as integers (`$defaultFn(Date.now)`, `$onUpdateFn(Date.now)`). Numbers, not `Date` objects, keep Redux state serializable.

**Step 5: Create tables (`src/db/schema/*.ts`), one file per table**

```ts
export const stops = sqliteTable(
  'stops',
  {
    id: id(),
    journeyId: text('journey_id')
      .notNull()
      .references(() => journeys.id, { onDelete: 'cascade' }),
    placeId: text('place_id').references(() => places.id, { onDelete: 'set null' }),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    altitude: real('altitude'),
    title: text('title').notNull(),
    mood: text('mood', { enum: MOODS }),
    visitedAt: integer('visited_at').notNull(),
    orderIndex: integer('order_index').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('stops_journey_order_idx').on(t.journeyId, t.orderIndex)],
);

export type Stop = typeof stops.$inferSelect; // row type used across the app
```

The tables are `journeys`, `stops`, `media`, `places` and `wishlist`. Foreign keys do the clean-up for me: deleting a journey cascades to its stops, and deleting a stop cascades to its media.

**Step 6: Generate migrations.** Run `yarn db:generate`. drizzle-kit compares the schema with the last snapshot and writes `0000_*.sql`, `0001_*.sql` and `migrations.js` into `src/db/migrations/`. After any schema change, run it again.

**Step 7: Run migrations before any screen renders (`src/db/DatabaseProvider.tsx`)**

```ts
useEffect(() => {
  (async () => {
    await configureDatabase();
    await migrate(db, migrations); // drizzle-orm/op-sqlite/migrator
    setStatus({ state: 'ready' });
  })();
}, []);
// loading → <Splash/>, error → <EmptyState/>, ready → children
```

In `App.tsx` it wraps the navigator, so **no screen can query a database that has not been migrated**.

**Step 8: One RTK Query API with no server (`src/api/baseApi.ts`)**

```ts
export const baseApi = createApi({
  reducerPath: 'localDb',
  baseQuery: fakeBaseQuery<DbError>(),
  tagTypes: TAG_TYPES, // from src/api/tags.ts
  keepUnusedDataFor: 30,
  endpoints: () => ({}),
});

export const runDb = async <T>(fn: () => Promise<T>) => {
  try {
    return { data: await fn() };
  } catch (e) {
    return { error: { message: e instanceof Error ? e.message : 'Unknown database error' } };
  }
};
```

**Step 9: Read data (a query endpoint)**

```ts
getStopsByJourney: build.query<StopListItem[], string>({
  queryFn: (journeyId) => runDb(() =>
    db.select({ ...getTableColumns(stops), mediaCount: count(media.id) })
      .from(stops).leftJoin(media, eq(media.stopId, stops.id))
      .where(eq(stops.journeyId, journeyId)).groupBy(stops.id).orderBy(asc(stops.orderIndex))),
  providesTags: (r, _e, journeyId) => [{ type: TAGS.Stop, id: `journey-${journeyId}` }],
}),
```

A screen then calls `const { data, isLoading, isError, refetch } = useGetStopsByJourneyQuery(journeyId)`.

**Step 10: Insert data (a mutation in a transaction)**

```ts
createStop: build.mutation<Stop, CreateStopInput>({
  queryFn: ({ media: picked, ...input }) => runDb(async () => {
    const stored = await importMediaBatch(picked, input.journeyId);      // files first
    try {
      return await db.transaction(async (tx) => {
        const [{ next }] = await tx.select({ next: max(stops.orderIndex) }).from(stops)
          .where(eq(stops.journeyId, input.journeyId));
        const [created] = await tx.insert(stops).values({ ...input, orderIndex: (next ?? -1) + 1 }).returning();
        if (stored.length) await tx.insert(media).values(toMediaRows(created.id, stored));
        return created;
      });
    } catch (e) { await deleteMediaFiles(stored); throw e; }             // no orphan files
  }),
  invalidatesTags: (_r, _e, { journeyId }) => [
    { type: TAGS.Stop, id: `journey-${journeyId}` },
    { type: TAGS.Journey, id: journeyId }, { type: TAGS.Journey, id: 'LIST' }, TAGS.Stats,
  ],
}),
```

The tags in `invalidatesTags` are what make the journey list, the map and the stats refresh by themselves after a save.

**Step 11: Update data.** `db.update(stops).set({...}).where(eq(stops.id, id)).returning()`. Drag-to-reorder is **optimistic**: `onQueryStarted` patches the cached list at once with `updateQueryData` and calls `patch.undo()` if the write fails.

**Step 12: Delete data (rows first, then files)**

```ts
const files = await db
  .select({ filePath: media.filePath, thumbnailPath: media.thumbnailPath })
  .from(media)
  .where(eq(media.stopId, id));
await db.delete(stops).where(eq(stops.id, id)); // media rows go too (ON DELETE CASCADE)
await deleteMediaFiles(files); // then the files on disk
```

If the app crashes in between, the worst case is an orphan file. A row never points at a missing file.

- **Delete a journey:** `db.delete(journeys)`, which cascades to its stops and media, then `deleteJourneyFolder(id)`.
- **Delete all:** one transaction deletes wishlist, media, stops, journeys and places; then the `media/` and `thumbs/` folders are removed; then `baseApi.util.resetApiState()` clears the cache.

**Step 13: Pitfalls to remember**

- In a single-table select, Drizzle drops the table prefix inside `sql\`\``, so `stops.journey_id = journeys.id`becomes`id = id`. Write those correlated subqueries as plain SQL.
- Insert in chunks of 50 rows, because older SQLite builds allow at most 999 variables per statement.
- Keep `MOODS` and the other enums in plain files (`src/db/moods.ts`, `src/db/enums.ts`) so Jest can import them without native code.

---

## 2. How media is managed (photos and videos)

### How it works

1. **Permission:** the camera and picker library asks for camera and picker access itself. The "Found in your photos" feature asks for photo-library and photo-location access through `PermissionsAndroid`.
2. **Capture or pick:** `react-native-image-crop-picker` (`openCamera` / `openPicker`) returns temporary files plus their EXIF data.
3. **Normalize:** each file becomes a `PickedMedia` object: photo or video, size, duration, time taken, GPS, altitude.
4. **Import:** the file is copied into the app's own folder (`media/<journeyId>/<mediaId>.<ext>`) and a 480 px thumbnail is made (`thumbs/<journeyId>/<mediaId>.jpg`). Videos get a thumbnail from the frame at 1 s.
5. **Save rows:** media rows are written in the same transaction as the memory, and they store **relative** paths.
6. **Display:** thumbnails are shown in grids, pins and covers; full files only in the pager. Videos play with `react-native-video`.
7. **Delete:** rows go first, then the files.

### Step-by-step implementation

**Step 1: Install and declare permissions**

```bash
yarn add react-native-image-crop-picker @react-native-camera-roll/camera-roll \
  @dr.pogodin/react-native-fs react-native-create-thumbnail \
  @bam.tech/react-native-image-resizer react-native-video
```

In `AndroidManifest.xml`, declare:

- `CAMERA`
- `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` (Android 13+)
- `READ_MEDIA_VISUAL_USER_SELECTED` (Android 14 partial access)
- `READ_EXTERNAL_STORAGE` (Android 12 and older)
- `ACCESS_MEDIA_LOCATION`, without which Android blanks the GPS tags of every photo

iOS needs the camera and photo-library usage texts in `Info.plist`.

**Step 2: Pick or capture (`src/services/picker.service.ts`)**

```ts
const PICKER_OPTIONS = {
  mediaType: 'any',
  includeExif: true,
  forceJpg: true,
  compressImageMaxWidth: 2560,
  compressImageMaxHeight: 2560,
  compressImageQuality: 0.85,
} as const;

export const pickFromLibrary = async (maxFiles = 30) => {
  try {
    return (await ImagePicker.openPicker({ ...PICKER_OPTIONS, multiple: true, maxFiles })).map(
      normalize,
    );
  } catch (e) {
    if (isCancel(e)) return [];
    throw e;
  } // cancelling is not an error
};

export const captureWithCamera = async (mediaType: 'photo' | 'video' = 'photo') =>
  normalize(await ImagePicker.openCamera({ ...PICKER_OPTIONS, mediaType }));
```

**Step 3: Tell photo from video and read the metadata (`normalize`)**

- `type = item.mime.startsWith('video/') ? 'video' : 'photo'`
- `durationMs` only for videos
- `takenAt` from EXIF `DateTimeOriginal`, falling back to the picker's `creationDate`
- `latitude`, `longitude` and `altitude` from `extractGps` and `extractAltitude` in `src/utils/exif.util.ts`, which handle Android's flat rational strings (`"24/1,36/1,123/100"`) and iOS's nested `{GPS}` objects

`suggestFromMedia(items)` returns the first item with GPS. That is the prefill offered when photos are picked.

**Step 4: The Android GPS catch, and "Found in your photos" (`src/services/photoLibrary.service.ts`)**

The Android system picker strips GPS from photos. For location suggestions I therefore read the library directly:

```ts
// Android 14: READ_MEDIA_IMAGES + READ_MEDIA_VISUAL_USER_SELECTED (limited access counts);
// Android 13: READ_MEDIA_IMAGES; older: READ_EXTERNAL_STORAGE. Always + ACCESS_MEDIA_LOCATION.
await PermissionsAndroid.requestMultiple([...reads, PERMISSIONS.ACCESS_MEDIA_LOCATION]);

const { edges } = await CameraRoll.getPhotos({
  first: 200,
  assetType: 'Photos',
  fromTime: from - 1,
  toTime: to,
  include: ['location'],
});
// drop photos with no location or with 0,0 (a hidden GPS tag)
```

If access was already granted, the app checks with `PermissionsAndroid.check` first and does not ask again; on Android 14 each new ask reopens the photo selector. `groupPhotosByPlace` then groups the photos into suggestions: photos within 1 km and 12 hours of a group's first photo join that group, up to 6 groups, newest first (`src/utils/photoSuggestion.util.ts`).

**Step 5: Copy into app storage (`src/services/mediaStorage.service.ts`)**

```ts
export const importMedia = async (item: PickedMedia, journeyId: string): Promise<StoredMedia> => {
  const id = uuidv4();
  const fileRel = `media/${journeyId}/${id}.${extensionOf(item.path, item.type)}`;
  await ensureDir(`media/${journeyId}`); await ensureDir(`thumbs/${journeyId}`);
  await copyFile(stripScheme(item.path), toAbsolute(fileRel));    // picker files are temporary
  let thumbnailPath = null;
  try { thumbnailPath = await makeThumbnail(item, toAbsolute(fileRel), journeyId, id); }
  catch { /* not fatal: the UI falls back to the full image */ }
  return { id, type: item.type, filePath: fileRel, thumbnailPath, ... };
};
```

- Files are imported **one at a time** (`importMediaBatch`) to keep memory flat with big videos. If one copy fails, the files already copied are deleted and the error is rethrown.
- After a successful save, `ImagePicker.clean()` removes the picker's temporary copies.

**Step 6: Make thumbnails, for photos and for videos**

```ts
if (item.type === 'video') {
  const frame = await createThumbnail({
    url: `file://${sourceAbs}`,
    timeStamp: 1000,
    format: 'jpeg',
  });
  const resized = await ImageResizer.createResizedImage(frame.path, 480, 480, 'JPEG', 80);
  await moveFile(resized.path, thumbAbs);
} else {
  const resized = await ImageResizer.createResizedImage(
    `file://${sourceAbs}`,
    480,
    480,
    'JPEG',
    80,
    0,
    undefined,
    false,
    { mode: 'contain', onlyScaleDown: true },
  );
  await moveFile(resized.path, thumbAbs);
}
```

Photos are already compressed to at most 2560 px by the picker. **Videos are copied as they are**: no re-encoding, only a poster thumbnail.

**Step 7: Store relative paths, build absolute ones when needed**

```ts
export const toAbsolute = (rel: string) => `${DocumentDirectoryPath}/${rel}`;
export const mediaUri = (rel?: string | null) => (rel ? `file://${toAbsolute(rel)}` : undefined);
```

The database holds `media/abc/123.jpg`, never a full path. iOS changes its app-container path between installs, and backups must restore on another device.

**Step 8: Display**

- **Grids, pins, covers and cards** use `thumbnailPath` only, so no full-size image is ever decoded for a small view.
- **The pager** (`MemoryDetailScreen/subcomponents/MediaPager.tsx`) is a horizontal `FlatList` with `pagingEnabled`. A photo is an `<Image resizeMode="contain">`. A video is:

```tsx
<Video
  source={{ uri }}
  controls
  resizeMode="contain"
  paused={page !== index} // only the visible page plays
  poster={mediaUri(item.thumbnailPath)}
/>
```

**Step 9: Add or remove media later.** `addMediaToStop` imports the files and inserts rows after the current highest `sortOrder`. `removeMediaFromStop` deletes rows with `.returning({ filePath, thumbnailPath })` and then deletes those files. The first item, by `sortOrder`, is the memory's cover.

---

## 3. How the map works

### How it works

- **Libraries:** `@maplibre/maplibre-react-native` (an open-source native map renderer), **OpenFreeMap** vector tiles (free, no API key), `@react-native-community/geolocation` for the user's position, and Turf plus bundled GeoJSON for visited regions.
- **Getting the map:** MapLibre downloads vector tiles from OpenFreeMap and draws them with my own dark style (`src/theme/mapStyle.ts`).
- **Data on top:** every memory is loaded with one query (`getMapStops`), then turned into GeoJSON: points for pins, lines for routes, and polygons for visited countries.
- **Pins:** amber dots and count clusters are drawn by **native MapLibre layers**, so 1,000+ pins stay smooth. When you zoom in, up to 40 visible memories are upgraded to **photo pins** (React views).

### Step-by-step implementation

**Step 1: Install** `@maplibre/maplibre-react-native @turf/distance @turf/boolean-point-in-polygon @react-native-community/geolocation`, then rebuild. Check that each library supports the New Architecture.

**Step 2: Write the map style (`src/theme/mapStyle.ts`)**

```ts
export const atlaslightMapStyle = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: { openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': colors.mapLand } },
    { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water',
      paint: { 'fill-color': colors.mapWater } },
    { id: 'roads', type: 'line', minzoom: 11, ... },   // roads only at street zoom
    // borders, place labels ...
  ],
};
```

I verified the URLs against `https://tiles.openfreemap.org/styles/dark`. Colours come from the theme tokens.

**Step 3: Wrap the map once (`src/components/map/AtlasMap.tsx`)**

```tsx
<Map
  mapStyle={style}
  touchRotate={false}
  touchPitch={false}
  compass={false}
  logo={false}
  attribution={false}
  dragPan={interactive}
  touchZoom={interactive}
  onDidFinishLoadingMap={onLoaded}
  onDidFailLoadingMap={onLoadError}
  onRegionDidChange={onRegionDidChange}
  onPress={onPress}
>
  <Camera
    ref={cameraRef}
    initialViewState={bounds ? { bounds, padding } : { center: [20, 20], zoom: 1.5 }}
  />
  {children}
</Map>
```

The same component is used three ways: the Map tab, the fixed (`interactive={false}`) journey route map, and the mini map in Memory detail.

**Step 4: Load the data (`src/api/map.api.ts`).** One select joins `stops` with `journeys` and returns `id, lat, lng, title, visitedAt, orderIndex, journey colour, journey title, favourite, ongoing`, plus the first thumbnail. It provides the `Journey/LIST` tag, which every write already invalidates, so the map refreshes on its own.

**Step 5: Turn rows into GeoJSON (pure, tested, `src/utils/mapFeatures.util.ts`)**

- `filterMapStops(stops, filter)`: all, ongoing, favourites or one journey (the chips).
- `stopsToPoints(stops)` gives a FeatureCollection of Points for the pins.
- `journeyRoutes(stops)` gives one LineString per journey, sorted by `orderIndex`.
- `visitedFeatures(visitedRegions(stops))` gives the country and state polygons to fill (see Q6).

**Step 6: Draw the pins (`src/components/map/StopPins.tsx`)**

```tsx
<GeoJSONSource id="stops" data={points} cluster clusterRadius={...} clusterMaxZoom={...} onPress={handlePress}>
  <Layer type="circle" id="stop-clusters"      filter={['has', 'point_count']}       paint={cluster} />
  <Layer type="symbol" id="stop-cluster-count" filter={['has', 'point_count']}
         layout={{ 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'] }} />
  <Layer type="circle" id="stop-dots"          filter={['!', ['has', 'point_count']]} paint={dot} />
  <Layer type="circle" id="stop-selected"      filter={['==', ['get', 'id'], selectedId ?? '']} paint={selected} />
</GeoJSONSource>
```

Clustering runs **on the native side**, so no JavaScript clustering library is needed.

**Step 7: Photo pins only when they are useful (`src/hooks/useMapPins.ts`)**

1. `onRegionDidChange` stores the current zoom.
2. Wait 200 ms for the camera to settle.
3. If the zoom is below 6, show no photo pins.
4. Otherwise call `mapRef.queryRenderedFeatures({ layers: ['stop-dots'] })` to get the unclustered dots on screen.
5. Keep those with a thumbnail, at most 40, and render each as `<Marker lngLat=...><MapPin variant="photo" uri={thumb} drop/></Marker>`.

**Step 8: Taps**

- **Dot:** `dispatch(setSelectedStopId(id))` and `camera.easeTo(stop)`. The memory opens in a sheet (phone) or a side panel (tablet).
- **Cluster:** `getClusterExpansionZoom(clusterId)`, then ease to the **cluster's own coordinates**. The tap point was not good enough: tapping the edge of a big cluster flew to the wrong city.
- Call `event.stopPropagation()` on pin presses; otherwise the map's own `onPress` fires too and clears the selection.

**Step 9: Routes, regions and wishlist layers**

- **Routes:** `<GeoJSONSource lineMetrics>` with a line layer that uses a `line-gradient` from teal to violet. `lineMetrics` lets the gradient follow the line's length.
- **Visited regions:** fill and outline layers placed `beforeId="state-borders"`, so borders and labels stay readable on top.
- **Wishlist:** violet ring circles, drawn under the memory pins.
- Settings switches (`showVisitedRegions`, `showRoutes`, `showPhotoPins`) skip these layers.

**Step 10: Opening view.** After `onDidFinishLoadingMap`, call `fitBounds(stopsBounds(allStops), { padding })` once. A camera move sent before the style loads is dropped. `stopsBounds` never frames less than about 5 km, so a single memory still shows its area.

**Step 11: Replay route (`src/hooks/useRouteReplay.ts`).** A `requestAnimationFrame` loop runs for 6 s. About every 33 ms it sets the source to `routeSlice(coordinates, elapsed / 6000)`, which returns the line up to that fraction of its length plus the interpolated "head" point. The loop is cancelled on unmount.

**Step 12: Geolocation on the map.** See Q7.

---

## 4. How backup and restore work

### How it works

A backup is one zip file:

```
atlaslight-backup-2026-11-17.zip
├── manifest.json   { format: "atlaslight-backup", version: 1, exportedAt, appVersion, counts }
├── data.json       { journeys, stops, media, places, wishlist }  (rows as stored)
├── media.zip       the media/ folder
└── thumbs.zip      the thumbs/ folder
```

- **Export** reads every row, zips the folders, bundles everything, and opens Android's _Save as_ dialog.
- **Restore** picks a zip, **validates all of it before changing anything**, asks for confirmation, then replaces the whole journal in **one database transaction**, swapping the media folders just before the commit. If anything fails, the journal is left exactly as it was.

Libraries: `react-native-zip-archive`, `@react-native-documents/picker`, `@dr.pogodin/react-native-fs`.

### Step-by-step implementation: export

**Step 1: Write the pure format logic first, with tests (`src/utils/backup.util.ts`)**

- `buildManifest(data, now, appVersion)`, `countRows`, `backupFileName(now)`, `requiredFreeSpace(mediaBytes)`
- Row schemas declared with `satisfies` against the Drizzle row types, so adding a database column breaks typecheck until the backup handles it.

**Step 2: Read all the rows (`src/api/backup.api.ts`)**

```ts
getBackupData: build.query<BackupData, void>({
  queryFn: () => runDb(async () => {
    const [journeys, stops, media, places, wishlist] = await Promise.all([
      db.select().from(journeysT), db.select().from(stopsT), db.select().from(mediaT),
      db.select().from(placesT), db.select().from(wishlistT)]);
    return { journeys, stops, media, places, wishlist };
  }),
  keepUnusedDataFor: 0,   // don't keep the whole journal in the cache
}),
```

**Step 3: Build the file (`src/services/backup.service.ts`, `createBackupFile`)**

1. Check free space: `getFSInfo().freeSpace >= requiredFreeSpace(mediaBytes)`.
2. Make a staging folder in the cache, then write `manifest.json` and `data.json`.
3. `zip([DocumentDirectoryPath/media], staging/media.zip)` and the same for thumbs. I used **inner zips** because the library names a folder's contents relative to that folder.
4. `zip([manifest, data, media.zip, thumbs.zip], cache/atlaslight-backup-<date>.zip, NO_COMPRESSION)`.
5. Report progress through the library's `subscribe` events (stages: reading, media, thumbs, bundling).
6. In `finally`, always delete the staging folder. On failure, also delete the half-built zip.

**Step 4: Save (`saveBackupFile`)**

```ts
const [result] = await saveDocuments({
  sourceUris: [`file://${path}`],
  mimeType: 'application/zip',
  fileName,
});
// OPERATION_CANCELED → 'cancelled' (not an error); finally → delete the cached copy
```

**Step 5: UI.** The `useBackupExport` hook drives a Settings button with a stage label and a progress bar. The button is disabled when the journal is empty.

### Step-by-step implementation: restore

**Step 6: Pick (`backupRestore.service.ts`, `pickBackupFile`).** `pick({ type: [types.zip], mode: 'import' })`. Cancelling returns `null`.

**Step 7: Stage and validate without touching the journal (`stageBackup`)**

1. `keepLocalCopy` copies the file into the cache.
2. Check free space against `getUncompressedSize`.
3. `listContents` the outer zip. If there is no `manifest.json` or `data.json`, stop with "not an Atlaslight backup".
4. Unzip only those entries into `restore-staging/outer`.
5. List the names inside `media.zip` and `thumbs.zip`.
6. Run **`validateBackup({ manifest, data, entries })`**, which rejects:
   - a wrong format, or a newer or older version
   - damaged rows (naming the table and row)
   - counts that differ from the manifest
   - repeated ids or repeated camera-roll asset ids
   - broken references (cover, journey, place, memory, wishlist)
   - unsafe paths and **zip-slip** names (`../`)
   - a missing media file. A missing thumbnail is allowed and set to `null`.
7. Only after the backup passes, unzip the media into `restore-staging/media` and `restore-staging/thumbs`, and write `data.validated.json`.
8. Return a summary ("7 journeys, 31 memories, 32 photos") for the confirm sheet.

Every failure deletes the staging folder and shows a readable reason.

**Step 8: Replace everything atomically (`restoreBackup` mutation)**

```ts
await db.transaction(async (tx) => {
  await tx.delete(wishlist);
  await tx.delete(media);
  await tx.delete(stops);
  await tx.delete(journeys);
  await tx.delete(places);
  // insert in chunks of 50: places → journeys (coverMediaId = null) → stops → media → wishlist
  // then set each journey's coverMediaId (journeys and media point at each other)
  swap.current = await swapMediaIn(); // last step before the commit
});
// catch: transaction rolled back + await swap.current?.undo(); rethrow
await swap.current?.commit(); // delete media.old / thumbs.old and the staging folder
```

**Step 9: Swap the folders by renaming (`swapMediaIn`).** For `media` and `thumbs`: move live to `*.old`, then move staged to live. Every step is recorded, so `undo()` can reverse exactly what happened. Renames on the same disk are instant; nothing is copied. Leftover `*.old` folders from an app that was killed mid-restore are cleaned up at the start of the next restore.

**Step 10: After the restore.** Reset the RTK Query cache and the Map, Journeys and Stats selections (`useResetJournalState`). Settings are not part of a backup and stay as they are.

---

## 5. How location search works

### How it works

There are two kinds of lookup, both using **Photon** (`photon.komoot.io`, OpenStreetMap data, free, no key):

- **Forward search** (text to places): the search bar on the Map, the Wishlist, and the place field in the memory form.
- **Reverse geocoding** (a point to a place name): naming a memory's location when it comes from photo EXIF, _My location_ or _Pick on map_.

Every result the user picks is cached in the `places` table, so the same point is never looked up twice. The Map search also checks **your own memories and journeys first**, which works instantly and offline.

### Step-by-step implementation

**Step 1: The network client (`src/services/geocoding.service.ts`)**

```ts
const fetchPhoton = async (path: string, signal?: AbortSignal) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // 8 s timeout
  signal?.addEventListener('abort', () => controller.abort()); // the caller cancels
  try {
    const res = await fetch(`https://photon.komoot.io${path}`, {
      headers: { 'User-Agent': 'Atlaslight' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(NETWORK_MESSAGE);
    return await res.json();
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new Error("Can't reach place search. Check your connection.");
  } finally {
    clearTimeout(timer);
  }
};

export const searchPlaces = (q: string, signal?: AbortSignal) =>
  q.trim().length < 3
    ? []
    : fetchPhoton(`/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`, signal).then(
        parsePhotonResponse,
      );

export const reversePlace = (lat: number, lon: number, signal?: AbortSignal) =>
  fetchPhoton(`/reverse?lat=${lat}&lon=${lon}&lang=en`, signal).then(
    (j) => parsePhotonResponse(j)[0] ?? null,
  );
```

**Step 2: Parse the response (pure, tested, `src/utils/photon.util.ts`).** `parsePhotonResponse` turns GeoJSON features into `PlaceSuggestion { name, locality, adminArea, countryCode, countryName, latitude, longitude }` and skips malformed entries.

**Step 3: Debounce typing (`src/hooks/useDebouncedValue.ts`).** Wait **400 ms** after the last keystroke. This is required by Photon's fair-use rules.

**Step 4: Wrap it in RTK Query (`src/api/places.api.ts`)**

```ts
searchPlaces: build.query<PlaceSuggestion[], string>({
  queryFn: (text, api) => runDb(() => searchPlaces(text, api.signal)),   // api.signal cancels stale requests
  keepUnusedDataFor: 60,
}),
```

Typing "Jai" and then "Jaip" cancels the first request automatically, and repeated queries come from the cache.

**Step 5: Search your own data first (`src/hooks/useMapSearch.ts` + `src/utils/mapSearch.util.ts`)**

```ts
const query = useDebouncedValue(text.trim(), 400);
const { data, isFetching, isError } = useSearchPlacesQuery(query, { skip: query.length < 3 });
return { local: searchLocal(stops, text), places: data ?? [], ... };
```

The results list shows "Your memories" and "Journeys" right away, then "Places" from Photon. A loading state covers the debounce, so "no places" never flashes while the user is typing.

**Step 6: Save the picked place, reusing the cache**

```ts
const NEARBY = 0.0005;   // about 55 m
const findNearbyPlace = (lat, lng, name?) => db.select().from(places).where(and(
  between(places.latitude,  lat - NEARBY, lat + NEARBY),
  between(places.longitude, lng - NEARBY, lng + NEARBY),
  name ? eq(places.name, name) : undefined)).limit(1);

savePlace:    cached ?? insert(suggestion, source 'photon')
resolvePlace: cached ?? (await reversePlace(lat, lng)) → insert at the ASKED point (source 'exif' | 'manual')
```

The reverse result is stored at the asked-for point, not at Photon's, so the next lookup there hits the cache. An empty reverse result (open sea) is not cached.

**Step 7: Use it.** The map flies to the place (`flyToPoint`, zoom 11). The memory form sets `latitude`, `longitude` and `placeId`. The wishlist adds the place, treating the same name within about 11 km as a duplicate. Only the typed text, or one coordinate pair, ever leaves the device.

---

## 6. How maps and locations work offline

### How it works

| Part                                | Offline? | How                                                                                        |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| Journeys, memories, photos, videos  | ✅       | SQLite + files on the device                                                               |
| Pins, clusters, routes              | ✅       | Built from the local database and drawn by MapLibre layers                                 |
| Visited countries and Indian states | ✅       | **Bundled GeoJSON + point-in-polygon**, no network                                         |
| Stats and the scratch map           | ✅       | Same bundled GeoJSON, drawn as SVG                                                         |
| Place names already looked up       | ✅       | The `places` cache table                                                                   |
| GPS position                        | ✅       | GPS needs no internet                                                                      |
| Base map tiles                      | ⚠️       | Need a network the first time; MapLibre keeps the tiles it has downloaded in its own cache |
| New place search                    | ❌       | Photon is online only; a friendly error is shown                                           |

### Step-by-step implementation

**Step 1: Bundle the region shapes**

1. Download Natural Earth `ne_50m_admin_0_countries.geojson` and `ne_10m_admin_1_states_provinces.geojson` (keeping only India).
2. Keep only `{ iso2, name }` and `{ name }`. Fix the `-99` codes for France and Norway with `ISO_A2_EH`.
3. Simplify: `npx mapshaper in.geojson -simplify 25% keep-shapes -o countries.json format=geojson precision=0.001`. That gives about 470 KB and 85 KB.
4. Put them in `src/assets/geo/` and export them from `index.ts`.

**Step 2: Point-in-polygon with a fast bounding-box pre-check (`src/utils/region.util.ts`)**

```ts
const boxes = new WeakMap<Feature, Box>();          // each feature's box is computed once
const findContaining = (collection, { latitude, longitude }) => {
  for (const f of collection.features) {
    const [w, s, e, n] = boxOf(f);
    if (longitude < w || longitude > e || latitude < s || latitude > n) continue;  // cheap reject
    if (booleanPointInPolygon([longitude, latitude], f)) return f;
  }
  return null;
};

export const regionOf = (point) => {
  const country = findContaining(countries, point);
  const state = !country || country.properties.iso2 === 'IN' ? findContaining(indiaStates, point) : null;
  ...  // a state just past the simplified coast still counts as India
};
```

**Step 3: Visited regions for the map.** `visitedRegions(points)` rounds each point to a cell of about 10 m (`toFixed(4)`), looks each cell up once, and returns the sorted country codes and states. `visitedFeatures` filters the bundled shapes to those, and the map draws them as amber fills.

**Step 4: Cache lookups across refetches (Stats).** `resolveRegions` keeps a module-level `Map` (capped at 20,000 cells). With 1,031 memories, a refetch went from 605 ms to 3 ms.

**Step 5: Tiles.** Use the OpenFreeMap style. When the style or tiles fail to load (`onDidFailLoadingMap`), show "The map needs a connection once — your memories are safe on this phone". Pins and regions still come from local data.

**Step 6: Locations offline**

- GPS (`getCurrentLocation`) works with no internet.
- A point that has already been named comes from the `places` cache.
- A new point can still be saved with only its coordinates; the place name is filled in when it can be.
- The country and state for stats always come from the bundled shapes, so they never depend on Photon.

**Step 7: Test it.** Turn off Wi-Fi and mobile data and relaunch. Check that the map, pins, regions, routes, stats and journeys all work, and that search shows its error message.

---

## 7. How live location works

### How it works

- **Only on request:** permission is asked the first time you tap **Locate** on the Map, and only for use while the app is open.
- The first tap takes one GPS fix and flies the camera there. After that, the position is **watched** (an update every 10 m of movement) **only while the Map tab is focused**. Leaving the tab stops the GPS.
- Your position is drawn as a pin with an aurora pulse. It is **never stored** and never leaves the device.
- Denied and unavailable each have their own notice with _Try again_.
- The same service powers **My location** in the memory form, which also returns altitude.

### Step-by-step implementation

**Step 1: Install and declare.** `yarn add @react-native-community/geolocation`, then add `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION` to the manifest and the location-when-in-use text to `Info.plist`. Do **not** request background location.

**Step 2: Service (`src/services/location.service.ts`)**

```ts
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  enableBackgroundLocationUpdates: false,
});

const options = { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 };

export const getCurrentLocation = (): Promise<LocationResult> =>
  new Promise((resolve) =>
    Geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          status: 'ok',
          latitude: coords.latitude,
          longitude: coords.longitude,
          altitude: cleanAltitude(coords.altitude),
        }),
      (error) => resolve({ status: locationErrorKind(error.code) }), // never throws
      options,
    ),
  );

export const watchLocation = (onFix, onError) => {
  const id = Geolocation.watchPosition(
    ({ coords }) => onFix(coords),
    (e) => onError(locationErrorKind(e.code)),
    { ...options, distanceFilter: 10 },
  );
  return () => Geolocation.clearWatch(id);
};
```

`locationErrorKind` (pure, tested) maps error codes to `'denied'` or `'unavailable'`.

**Step 3: State in Redux (`mapUiSlice`).** It holds `locationStatus: 'off' | 'locating' | 'on' | 'denied' | 'unavailable'` and `userPosition`. This is not persisted.

**Step 4: Hook (`src/hooks/useLiveLocation.ts`)**

```ts
const focused = useIsFocused();
const following = status === 'on' && focused;

useEffect(() => {
  if (!following) return undefined;
  return watchLocation(
    (p) => dispatch(setUserPosition(p)),
    (f) => dispatch(setLocationStatus(f)),
  );
}, [following]); // the cleanup clears the watch when you leave the tab

const locate = async () => {
  if (status === 'on' && position) return flyToPoint(position.latitude, position.longitude);
  dispatch(setLocationStatus('locating'));
  const r = await getCurrentLocation();
  if (r.status !== 'ok') return dispatch(setLocationStatus(r.status));
  dispatch(setLocationStatus('on'));
  dispatch(setUserPosition(r));
  flyToPoint(r.latitude, r.longitude);
};
```

**Step 5: UI.** `MapButtons` holds the Locate button (with a spinner while locating). `UserLocationPin` is a Marker with a Reanimated pulse in the aurora colours. `LocationNotice` covers denied and unavailable. Settings shows the permission status (`PermissionsAndroid.check`) with an _Open app settings_ shortcut.

---

## 8. How stats are calculated

### How it works

The work is split into a costly part that runs once per data change, and a cheap pure part that runs on every year-chip tap:

```
getStatsData (queryFn)  → read journeys + memories → resolveRegions (country lookup, cached)
computeStats(journeys, stops, filter, now)  → every number on the screen (pure, tested)
```

Nothing is stored. Everything is computed from the rows on the device, offline.

### Step-by-step implementation

**Step 1: Read the inputs (`src/api/stats.api.ts`)**

- Journeys: `id, startDate, endDate`.
- Stops: `id, journeyId, orderIndex, visitedAt, lat, lng, altitude, title`, the place name (left join `places`), and the photo count (a subquery).
- Then `resolveRegions(stopRows)` attaches `{ countryCode, countryName, state }` to each memory.
- It provides `TAGS.Stats` **and** `Journey/LIST`, because reordering memories only invalidates the list but changes the distance.

**Step 2: Write `computeStats` as a pure function (`src/utils/stats.util.ts`).** `now` is passed in, so tests are exact.

1. **Filter:** `'all'`, or journeys whose `startDate` year equals the chip. A journey counts for the year it starts in.
2. **Distance:** group the picked memories by journey, sort each by `orderIndex`, sum `routeDistanceKm` (Q9).
3. **Earth fraction:** `distanceKm / 40_075`.
4. **Countries:** the set of `region.countryCode` over the picked memories.
5. **New countries:** for each country, the first `visitedAt` across **every memory ever**; count those whose year is the chip's year (or the current year for All time).
6. **Journeys, days away:** `chosen.length`, and the sum of `tripDays(start, end ?? now)`.
7. **Memories, photos:** the count, and the sum of `photoCount`.
8. **Highest point:** the memory with the largest non-null altitude, named by its place (or its title). Null hides the tile.
9. **Journeys per year:** every year from the first journey to the last, including zeros. The chip does not change this.
10. **Years and first journey:** for the chips and the "Since March 2019" line.

**Step 3: Keep the year chip cheap**

```ts
const { data } = useGetStatsDataQuery();
const filter = useAppSelector(selectStatsFilter); // statsUi slice
const stats = useMemo(
  () => data && computeStats(data.journeys, data.stops, filter, Date.now()),
  [data, filter],
);
```

**Step 4: Draw it without a chart library**

- `ProgressBar` (Earth), `StatTile` with `useCountUp` (800 ms, once), `YearBars` (Views grown with `scaleY`), and `WishlistCard`.
- **The scratch map** (`scratchMap.util.ts` + `ScratchMap.tsx`) converts the bundled countries to SVG paths. It uses a plate carrée projection scaled by the cosine of the middle latitude, thins points, drops tiny specks, and builds two paths: visited (amber) and not visited.
- Units come from `settings.units` through `formatDistance(km, 'km' | 'mi')`.

**Step 5: Test it.** `stats.util.test.ts` uses small fixtures for the year filter, the "new countries" baseline, the highest point, gap years, and an empty journal.

---

## 9. How distance calculation works

### How it works

Distance is the **great-circle distance** (the shortest path over the Earth's surface, using the haversine formula through Turf), summed **leg by leg in route order** within each journey, and then summed over journeys. It is never stored; it is recomputed from the coordinates.

### Step-by-step implementation

**Step 1: Install** `@turf/distance`.

**Step 2: The core function, pure and tested (`src/utils/geo.util.ts`)**

```ts
export const routeDistanceKm = (points: LatLng[]): number => {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distance(
      [points[i - 1].longitude, points[i - 1].latitude], // Turf wants [lng, lat]
      [points[i].longitude, points[i].latitude],
      { units: 'kilometers' },
    );
  }
  return total;
};
```

**Step 3: Order matters.** Always sort by `orderIndex` (the route order the user can drag), not by time. A route A, B, C is a different length from A, C, B.

**Step 4: Per journey, in SQL plus JS (`journeys.api.ts`, `routeDistances`).** One select gets `journeyId, lat, lng` ordered by `(journeyId, orderIndex)`. JavaScript groups the points by journey and calls `routeDistanceKm` for each. The result gives the `distanceKm` on each journey card and detail.

**Step 5: Totals.** Stats sums the per-journey distances, so the jump from the end of one trip to the start of the next is not counted.

**Step 6: Display.** `formatDistance(km, unit)` converts to miles (÷ 1.609344) when needed, shows whole numbers from 100 up and one decimal below, and adds thousands separators (`1,240 km`).

**Step 7: Edge cases**

- 0 or 1 memories give 0 km.
- Two identical points give 0.
- A leg that crosses the antimeridian is measured correctly by Turf, but on the map it is _drawn_ the long way round. That drawing limit is documented for v1.

---

## 10. How On this day works

### How it works

When the Map opens, the app looks for a memory from **today's month and day in an earlier year**, using the device's local time. If it finds one, it shows a card: "2 years ago · Chandratal". Tapping the card flies to that memory and selects it.

Rules:

- The most recent past year wins.
- Within the same year, the earliest time of day wins.
- A 29 February memory only matches on 29 February.

### Step-by-step implementation

**Step 1: The pure function (`src/utils/onThisDay.util.ts`)**

```ts
export const findOnThisDay = <T extends { id: string; visitedAt: number }>(
  stops: T[],
  now = Date.now(),
): T | null => {
  const today = new Date(now);
  let best: T | null = null;
  for (const stop of stops) {
    const d = new Date(stop.visitedAt);
    if (d.getFullYear() >= today.getFullYear()) continue; // past years only
    if (d.getMonth() !== today.getMonth() || d.getDate() !== today.getDate()) continue;
    const bestDate = best && new Date(best.visitedAt);
    if (
      !best ||
      d.getFullYear() > bestDate!.getFullYear() ||
      (d.getFullYear() === bestDate!.getFullYear() && stop.visitedAt < best.visitedAt)
    )
      best = stop;
  }
  return best;
};
```

Local `getMonth()` and `getDate()` are used on purpose: "this day" means the user's calendar day, not UTC.

**Step 2: Test it.** Pass a fixed `now` and check: same day last year, two candidate years (the newer wins), the same year at two times (the earlier wins), today in the current year (excluded), and 29 February.

**Step 3: Use it on the Map.** `useMemo(() => findOnThisDay(allStops), [allStops])` runs on all memories, ignoring the chip filter, because the card is part of the home view. It reuses the data the map already has, so there is no extra query.

**Step 4: The card (`components/map/OnThisDayCard.tsx`).** It shows the thumbnail, the title, the journey and a relative date (`2 years ago` from `format.util`), with press-scale feedback. It is hidden while searching, while the phone sheet is open, or after the user closes it.

---

## 11. How the responsive layout works (tablet landscape and phone portrait)

### How it works

The layout depends on the **window width, not the device model**. That way split screen, foldables and rotation all behave correctly. One hook, `useWindowClass()`, is the only place the breakpoints live:

| Class      | Width      | Typical device            | Navigation                          | Selected item                | Forms          |
| ---------- | ---------- | ------------------------- | ----------------------------------- | ---------------------------- | -------------- |
| `compact`  | < 600 dp   | phone portrait            | floating pill tab bar at the bottom | bottom sheet                 | full screen    |
| `medium`   | 600–899 dp | tablet portrait, foldable | left rail                           | sheet (Map), grid (Journeys) | centred dialog |
| `expanded` | ≥ 900 dp   | tablet landscape          | left rail                           | **400 dp side panel**        | centred dialog |

### Step-by-step implementation

**Step 1: The hook (`src/hooks/useWindowClass.ts`)**

```ts
const { width, height } = useWindowDimensions(); // updates on rotate, fold, split screen
const insets = useSafeAreaInsets();
const windowClass = width >= 900 ? 'expanded' : width >= 600 ? 'medium' : 'compact';
return {
  windowClass,
  isLandscape: width > height,
  width,
  height,
  margin: { compact: width < 360 ? 12 : 16, medium: 24, expanded: 32 }[windowClass],
  bottomChrome: windowClass === 'compact' ? tabBarHeight + 32 + insets.bottom : insets.bottom + 24,
  gridColumns: { compact: 1, medium: 2, expanded: 3 }[windowClass],
  statColumns: { compact: 2, medium: 3, expanded: 4 }[windowClass],
};
```

**Step 2: Safe areas on all four edges (`components/layout/Screen.tsx`).** `<SafeAreaView edges={['top','right','bottom','left']}>` plus the class margin. In landscape, the camera cutout and navigation bar move to the sides, so all four edges matter.

**Step 3: One tab navigator that changes its bar (`Navigation/MainTabs.tsx` + `components/navigation/TabBar.tsx`)**

```tsx
<Tab.Navigator tabBar={(p) => <TabBar {...p} />}
  screenOptions={{ headerShown: false, tabBarPosition: compact ? 'bottom' : 'left' }}>
// TabBar: compact ? <PhoneTabBar/> (floating pill) : <TabletRail/> (88 dp, + button on top, Settings at bottom)
```

There is a single navigator, so the current tab and its state survive a rotation.

**Step 4: Forms change presentation (`Navigation/RootNavigator.tsx`)**

```ts
const formOptions = compact ? undefined : { presentation: 'transparentModal', animation: 'fade' };
```

The same screen renders inside `FormFrame`, which is full screen on a phone and a centred card over a dimmed background on a tablet. It also lifts above the keyboard.

**Step 5: Screens branch on the class**

- **Map:** on `expanded`, a `MapPanel` slides in from the right using a `springs.gentle` shared value, and the map buttons move left with it (`translateX: -progress * panelWidth`). Otherwise a `MapSheet` (`@gorhom/bottom-sheet`) is used.
- **Journeys:** compact shows the ongoing hero card, then rows grouped by year (FlashList). Wider windows show a card grid whose column count comes from the measured pane width (`columnsForWidth`, minimum card width 240). On `expanded`, a tap previews the journey in the side panel instead of opening it.
- **Journey detail:** phone is a single scroll column. Tablet puts the route map and the timeline side by side.
- **Memory detail and Wishlist:** full screen on phones, a right-hand `SidePanelFrame` on wider windows.
- **Stats:** a single column (capped at 640 dp and centred on medium) below 900 dp, and a **2-column dashboard** at 900 dp and above.
- **Settings:** one column, centred and capped at 640 dp on wide windows.

**Step 6: Bottom spacing.** Scroll content adds `bottomChrome` (plus the FAB height on phones) as padding, so nothing hides under the floating tab bar.

**Step 7: Size-change bugs to guard against**

- A closed bottom sheet keeps its old position when the window height changes and peeks out empty. Fix: `key={\`${width}x${height}\`}`on`MapSheet`and`AppBottomSheet`, so they remount.
- Android recreated fragments after a density or size change and crashed. Fix: `super.onCreate(null)` in `MainActivity`.
- Measure panes with `onLayout` instead of guessing from the window width, because the rail and panel take space.

**Step 8: Verify on a real device with adb**

```bash
adb shell wm size 720x1560        # simulate a phone on the tablet
adb shell wm size reset           # back to the tablet
adb shell settings put system user_rotation 1   # landscape (with auto-rotate off)
adb exec-out screencap -p > shot.png
```

I checked at 360×640, 390×844, 430×932, 800×1280, 840×900 and 1280×800 dp, in portrait and landscape.
