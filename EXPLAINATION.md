# Atlaslight: the whole project, explained

This is a walk-through of Atlaslight, a React Native app I built as a portfolio project. It covers what the app does, why I made each technical choice, how the code is organised, how the data flows, how I tested and measured it, and what is still open. I wrote it to answer an interviewer's questions in one place.

---

## 1. The 30-second pitch

**Atlaslight is an offline-first travel journal for Android phones and tablets.** You record _journeys_ (trips) and add _memories_ to them: a place, a date and time, a mood, a note, and photos or videos. Everything appears on one dark world map. Each memory is an amber pin, each trip's route is a teal-to-violet ("aurora") line, and the countries you have visited are filled in amber.

- **No backend, no accounts, no sync.** All data lives in SQLite on the device. Only two things use the network: map tiles (OpenFreeMap) and place search (Photon). Both are free and need no API key.
- **Zero setup for a reviewer.** One tap on _Load demo journeys_ in Settings adds 7 sample trips with bundled photos.
- **Engineering on show:** local relational database with migrations, media handling (copy, compress, thumbnail), EXIF parsing, a vector map with clustering and 1,000+ pins, offline point-in-polygon geography, responsive phone/tablet/foldable layouts, animations, backup/restore with atomic rollback, a signed and minified release APK, and measured performance numbers.

---

## 2. Features (what a user can do)

| Area                     | What it does                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Journeys**             | Create, edit, delete and favourite trips. A trip with no end date is _ongoing_. Only one can be ongoing; starting a new one asks to end the current one. Each journey gets a colour from a token palette automatically.                                                                                                                                                                                                       |
| **Memories**             | Add a memory with photos/videos from the library or camera (up to 30 per add), a location, date and time, mood (`happy, calm, adventurous, romantic, nostalgic, tired`) and a note (up to 2,000 chars). Edit, add or remove media, delete, and drag to reorder the route.                                                                                                                                                     |
| **Found in your photos** | Reads the phone's photo library for the journey's date range, groups photos that were taken within 1 km and 12 hours of each other, and offers each group as a ready-made memory (location, time and altitude prefilled).                                                                                                                                                                                                     |
| **Location sources**     | A memory's place comes from photo EXIF, Photon search, _My location_ (one GPS fix, asked only on tap) or _Pick on map_ (pan the map under a fixed marker).                                                                                                                                                                                                                                                                    |
| **Map (home tab)**       | Dark custom MapLibre style. Amber dots at world zoom, clusters with counts, photo pins when zoomed in (zoom 6+, at most 40), visited countries and Indian states filled in amber, aurora route lines, violet wishlist rings, live location with a pulse, search across your own memories first and then Photon, filter chips, and an _On this day_ card. Tapping a pin opens a bottom sheet (phone) or a side panel (tablet). |
| **Journey detail**       | Cover hero, four stats (memories, photos, distance, days), a route map with **Replay route** (the line draws itself over 6 seconds), the description and a drag-to-reorder timeline.                                                                                                                                                                                                                                          |
| **Memory detail**        | Swipeable photo/video pager, place card with coordinates, mood, note, media grid and a small map of the place.                                                                                                                                                                                                                                                                                                                |
| **Stats**                | Total distance with an "around the Earth" progress bar, countries visited (with "+N this year"), journeys, days away, memories, photos, highest point (from altitude), a world "scratch map" drawn in SVG, journeys per year, and "Next on your wishlist". Year chips filter everything.                                                                                                                                      |
| **Wishlist**             | Places you want to go. Search with Photon, tap to add, tap X to remove. Shown on the map in violet so "want to go" never looks like "been there".                                                                                                                                                                                                                                                                             |
| **Settings**             | Display name, km/mi, three map layer toggles, permission status with a shortcut to system settings, database and media sizes, **Back up to a file**, **Restore from a file**, **Load demo journeys**, source link, version, and **Delete all data**.                                                                                                                                                                          |
| **Layouts**              | Phone: floating pill tab bar, bottom sheets, full-screen forms. Tablet/foldable: left navigation rail, a 400 dp right-hand side panel, forms as centred dialogs, a 2-column Stats dashboard. Portrait, landscape and split screen all work.                                                                                                                                                                                   |

---

## 3. Tech stack, and why

| Part        | Choice                                                                                                                          | Why                                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App         | **React Native 0.88.1** (CLI, not Expo), New Architecture, Hermes, React 19.3                                                   | Full control over native modules (SQLite, MapLibre, media). Android first; iOS compiles in principle but is not tested.                                                           |
| Language    | **TypeScript 5.9, strict**                                                                                                      | No `any`, no unexplained `!` or `as`, explicit return types on exports.                                                                                                           |
| Database    | **op-sqlite** + **Drizzle ORM**                                                                                                 | op-sqlite is a fast JSI SQLite binding. Drizzle gives typed SQL, schema-as-code and generated migrations.                                                                         |
| Data access | **RTK Query with `queryFn`** over the local DB                                                                                  | Without a server I still get caching, loading/error states and tag-based invalidation. When a memory is saved, the map, the journey list and the stats all refresh by themselves. |
| UI state    | **Redux Toolkit** + **redux-persist** + AsyncStorage                                                                            | Filters, selections and settings. Only the `settings` slice is persisted.                                                                                                         |
| Navigation  | **React Navigation 7** (native stack + bottom tabs)                                                                             | One tab navigator for all sizes; its tab bar is drawn at the bottom on phones and on the left (rail) on wider windows.                                                            |
| Map         | **@maplibre/maplibre-react-native 11** + **OpenFreeMap** tiles                                                                  | Open source, no API key, supports a fully custom style and native clustering.                                                                                                     |
| Geo         | **@turf/distance**, **@turf/boolean-point-in-polygon**, bundled **Natural Earth** GeoJSON                                       | Great-circle distances, and country/state lookup that works offline.                                                                                                              |
| Media       | react-native-image-crop-picker, camera-roll, react-native-fs, create-thumbnail, image-resizer, react-native-video, fast-image   | Picking, reading library GPS, copying files, thumbnails, playback.                                                                                                                |
| UI          | Reanimated 4, Gesture Handler, @gorhom/bottom-sheet, react-native-svg, lucide icons, FlashList 2, react-native-reorderable-list | Smooth springs, sheets, hand-drawn charts, fast lists, timeline drag-reorder.                                                                                                     |
| Forms       | react-hook-form + **zod**                                                                                                       | Typed schemas; errors show on blur, not on every keystroke.                                                                                                                       |
| Backup      | react-native-zip-archive, @react-native-documents/picker                                                                        | Zip export and a system "Save as" dialog; picking a backup file to restore.                                                                                                       |
| Tests       | **Jest**, pure logic only                                                                                                       | EXIF parsing, geo, stats maths, backup validation and so on. 281 tests.                                                                                                           |
| Tooling     | ESLint 9 (flat config), Prettier 3, Yarn classic, `@/` import alias                                                             | Formatting is automatic; lint rules enforce the conventions.                                                                                                                      |

Things I removed on purpose. The project began from a boilerplate built for a REST backend. I took out TanStack Query, axios, the keychain token, the login screen, the auth slice and `react-native-config`, because none of them fit an offline app.

I also chose **not** to add some libraries: no chart library (charts are Views + SVG), no haptics, no bootsplash library, no `react-native-permissions` and no `supercluster`, because MapLibre already clusters natively.

---

## 4. Architecture

### 4.1 Layers

```
Screen (src/screens/<Name>Screen)          layout, local state, Redux selectors
  -> RTK Query hook (src/api/*.api.ts)      caching, loading/error, tag invalidation
    -> queryFn + runDb()                    typed result or { error }
      -> Drizzle ORM (src/db)               typed SQL
        -> op-sqlite (journeys.db)          on-device SQLite, WAL, foreign keys ON
Media files -> src/services/mediaStorage.service.ts -> app documents directory
```

The rule is strict: **a screen never touches the database.** It calls a generated hook such as `useGetJourneysQuery()`. That hook runs a `queryFn`, which wraps a Drizzle call in `runDb()`. Device and IO code (files, picker, GPS, geocoding, backup) lives in `src/services/*.service.ts`. Pure logic lives in `src/utils/*.util.ts` and has tests.

### 4.2 RTK Query without a server

`src/api/baseApi.ts` creates one API with `fakeBaseQuery` and no endpoints. Each feature adds its own with `injectEndpoints`:

```ts
export const runDb = async <T>(fn: () => Promise<T>) => {
  try {
    return { data: await fn() };
  } catch (e) {
    return { error: { message: e instanceof Error ? e.message : 'Unknown database error' } };
  }
};
```

`runDb` turns any thrown error into RTK Query's `{ error }` shape, so every screen gets `isLoading`, `isError` and `refetch` for free. `keepUnusedDataFor: 30` drops unused cache entries quickly because local reads are cheap.

**Cache tags** are constants in `src/api/tags.ts` (`Journey`, `Stop`, `Media`, `Place`, `Wishlist`, `Stats`); tag strings are never written inline. Queries provide `{ type, id }` plus `{ type, id: 'LIST' }`, and mutations list exactly what they invalidate. Some examples of the reasoning:

- `createStop` invalidates the journey's stop list, that journey, the journey LIST and `Stats`, because counts, covers, distances and stats all change.
- `getMapStops` provides only `Journey/LIST`. Every write that affects the map already invalidates that tag, so the map needs no tag of its own.
- `deleteJourney` deliberately does **not** invalidate `{ Journey, id }`, so a screen still open on that journey does not try to reload a row that no longer exists.
- `reorderStops` is **optimistic**: `onQueryStarted` patches the cached timeline at once with `updateQueryData` and calls `patch.undo()` if the write fails.

### 4.3 State rules

- **Data = SQLite through RTK Query.** DB rows are never copied into other slices.
- **UI and settings = Redux Toolkit slices:** `settings` (persisted), `journeysUi`, `mapUi` (filter, selected pin, location state), `statsUi` (year chip). Typed hooks are `useAppDispatch` and `useAppSelector`.
- **`useContext` is banned** in app code (ESLint enforces this). Shared state goes through Redux.
- **Serializable data:** ids are UUID strings and timestamps are epoch milliseconds, never `Date` objects.
- **Persistence:** only `settings` is whitelisted. `autoMergeLevel2` merges saved settings over the defaults, so a setting added in a later version starts at its default on an existing install.

### 4.4 App start-up

`App.tsx` wraps the app in this order: `GestureHandlerRootView`, then Redux `Provider`, then `DatabaseProvider`, then `PersistGate`, then `SafeAreaProvider`, then `ErrorBoundary` with `AppNavigation`, with a global `AppToast`.

`DatabaseProvider` blocks rendering until it has run the pragmas (`foreign_keys = ON`, because SQLite leaves them off by default and cascades would do nothing; `journal_mode = WAL` for non-blocking reads) and the Drizzle migrations. Until then it shows the splash. So **no screen can ever query an unmigrated database**. If migration fails, it shows an error state instead of crashing.

### 4.5 Navigation

- `SCREENS` in `src/Navigation/routes.ts` holds every route name; nothing is hardcoded.
- **Root stack:** `Main` (tabs), `JourneyDetail`, `JourneyForm`, `MemoryDetail`, `MemoryForm`, `MapPick`, `Wishlist`, and `Kit` (registered only in `__DEV__`).
- **Tabs:** Map, Journeys, Stats, Settings. One navigator: `tabBarPosition` is `bottom` on compact windows and `left` (rail) otherwise.
- **Forms adapt:** on phones they push full screen. On wider windows they open as `transparentModal` with a fade, so they look like a dialog over the screen you came from.
- `MapPick` returns the chosen point to the form with `popTo` and merged params.

---

## 5. Data model

The schema is in `src/db/schema/`, and migrations are generated with `yarn db:generate` into `src/db/migrations/`. There are two so far: `0000` is the initial schema and `0001` adds `stops.altitude`.

| Table              | Key fields                                                                                                                                                              | Notes                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `journeys`         | id, title, description, coverMediaId → media (set null), color, startDate, endDate (null = ongoing), isFavorite, createdAt, updatedAt                                   |                                                                                     |
| `stops` (memories) | id, journeyId → journeys (**cascade**), placeId → places (set null), latitude, longitude, altitude (nullable, m), title, note, mood, visitedAt, orderIndex              | `orderIndex` = route order. Indexed on (journeyId, orderIndex), visitedAt, placeId. |
| `media`            | id, stopId → stops (**cascade**), type photo/video, filePath, thumbnailPath, width, height, durationMs, takenAt, latitude, longitude, sourceAssetId (unique), sortOrder | Paths are **relative** to the documents directory.                                  |
| `places`           | id, name, locality, adminArea, countryCode, countryName, lat/lng, source (photon/manual/exif)                                                                           | A reverse-geocoding cache.                                                          |
| `wishlist`         | id, placeId → places (unique, cascade), note                                                                                                                            |                                                                                     |

Some values are **computed, not stored**: distance, countries visited, all stats. Settings live in Redux, not SQLite.

Why are media paths relative? iOS app-container paths change between installs, and a backup must restore on any device. `toAbsolute()` and `mediaUri()` build the real path when a file is shown.

One query gotcha: in single-table selects Drizzle drops the table prefix from interpolated columns. A correlated subquery such as `stops.journey_id = journeys.id` would become `id = id`. For those subqueries (counts, cover thumbnail, dominant region) I write plain SQL and comment why.

---

## 6. How the main features work

### 6.1 Media pipeline (`mediaStorage.service.ts`)

1. The picker returns files plus EXIF.
2. Each file is **copied** into `media/<journeyId>/<mediaId>.<ext>`. Photos are compressed to at most 2560 px JPEG; videos are copied as they are.
3. A **thumbnail** is made at `thumbs/<journeyId>/<mediaId>.jpg`, 480 px on the long edge at quality 80, which is sharp enough for 3-column grids and 52 px pins. Videos get a frame at 1 s. A failed thumbnail is not fatal; the UI falls back to the full image.
4. Files are imported **one at a time**, which keeps memory flat for big videos.
5. **Files before rows, rows before files.** When creating, files are copied first and then the DB transaction runs; if the transaction fails, the copied files are deleted, so a failed save leaves no orphans. When deleting, rows go first and files second; a crash in between can leave orphan files but never a row pointing at a missing file.

### 6.2 EXIF (`exif.util.ts`)

Android and iOS return EXIF in different shapes. On Android the keys are flat and values are rationals (`"24/1,36/1,123/100"`). On iOS they are nested (`{GPS}.Latitude`). `extractGps`, `extractAltitude` and `extractTakenAt` handle both:

- They convert degrees/minutes/seconds to decimal degrees and apply the N/S/E/W refs.
- They reject `0,0`, which many cameras write when GPS was off, and out-of-range values.
- They treat altitude ref `1` as below sea level, and `cleanAltitude` drops values outside −500 to 9,000 m as sensor noise.
- They read EXIF dates (`YYYY:MM:DD HH:MM:SS`) as device-local time, because EXIF has no time zone, and ignore years before 1990.

A real-world gotcha: **the Android system photo picker strips GPS from photos.** That is why _Found in your photos_ uses `@react-native-camera-roll/camera-roll` with `ACCESS_MEDIA_LOCATION`, which returns real coordinates. Partial ("selected photos only") access on Android 14 is also handled.

### 6.3 Place search and caching (`geocoding.service.ts` + `places.api.ts`)

- Photon is called with a `User-Agent`, an **8 s timeout** through `AbortController`, at most 6 results, and only for 3+ characters. The screen **debounces typing by 400 ms**.
- A cancelled request (the user kept typing) is passed through. Real failures become a friendly "Can't reach place search" message.
- `resolvePlace` checks the **cache first**: a stored place within about 55 m counts as the same spot. Only new points go to Photon, and the result is stored at the asked-for point so the next lookup there is a cache hit. Empty results are not cached. This follows Photon's fair-use rules: never look up the same point twice.
- Only the typed text or one coordinate pair ever leaves the device.

### 6.4 Offline geography (`region.util.ts`)

Visited countries and Indian states are worked out **on the device**, not with the network. Two bundled GeoJSON files (from Natural Earth, public domain, simplified with mapshaper to about 470 KB and 85 KB) are tested with Turf point-in-polygon.

- A **bounding box per feature** is computed once (cached in a `WeakMap`) and rejects most points before the costly polygon test.
- Points are rounded to about 10 m cells (`toFixed(4)`), and each cell is looked up once.
- In Stats, the lookups are **kept between refetches** (capped at 20,000 cells). Adding one memory therefore does not redo 1,000 lookups: a refetch went from 605 ms to 3 ms.
- Natural Earth data issues were fixed by hand: France and Norway are marked `-99` (I used `ISO_A2_EH`), and Somaliland, N. Cyprus and Siachen were mapped to SO, CY and IN.
- The simplified state shapes can extend a few hundred metres past the coast, so a point that is inside a state but outside the country polygon is still counted as India.

### 6.5 The map

- **`AtlasMap`** uses a custom dark style (`src/theme/mapStyle.ts`) on OpenFreeMap vector tiles. Water is darker than land, borders are thin, labels are quiet, and roads show only at street zoom.
- **`StopPins`**: one clustered `GeoJSONSource` drawn by **native** layers (cluster circles, count labels, amber dots, a selected ring). Clustering happens on the native side, which keeps the map smooth with 1,000+ pins.
- **Photo pins** are React `Marker` views, so they are expensive. `useMapPins` adds them only at zoom 6 and above, waits 200 ms for the camera to settle, asks the map which unclustered dots are in view (`queryRenderedFeatures`), and draws at most 40.
- Tapping a cluster zooms to its expansion zoom **centred on the cluster's own coordinates**. That fixed a bug where tapping the edge of a big cluster flew to the wrong city.
- Pin presses call `stopPropagation()`; otherwise the map's own press would immediately clear the selection.
- **VisitedRegions** fills countries and states in amber, **RouteLines** draws the aurora gradient routes, and **WishPins** draws violet rings under the memory pins.
- Settings toggles can hide regions, routes and photo pins.

### 6.6 Route replay (`useRouteReplay`)

The line grows from start to end over 6 seconds by updating a GeoJSON source about 30 times a second inside `requestAnimationFrame`. At that rate it looks smooth and costs little. The loop is cancelled on unmount, so leaving the screen mid-replay does not keep it running. The journey route map is fixed (no pan or zoom), so it never fights the page scroll; you tap a dot to open that memory.

### 6.7 Live location

Location is requested **only when you tap Locate**, and only "while using". The position is followed only while the Map tab is focused, and GPS stops when you leave. Nothing is stored. There are separate states for permission denied and location unavailable.

### 6.8 Stats (`stats.util.ts` + `stats.api.ts`)

The work is split in two:

1. `getStatsData` (in the `queryFn`) reads journeys and memories and runs `resolveRegions` **once per data change**.
2. `computeStats(journeys, stops, filter, now)` is a **pure function** that runs on each year-chip change. `now` is passed in, so tests are exact.

Rules:

- **Distance** is the great-circle sum along each journey's route order.
- The Earth bar compares the distance with 40,075 km.
- A journey counts for the year it starts in.
- "+N new countries this year" is measured against every memory ever, so a country first seen in 2023 is not "new" in 2025.
- Highest point is the highest memory that has an altitude; the tile is hidden when none does.
- Journeys per year includes the years with zero journeys.

The **scratch map** is drawn in SVG from the bundled countries file. It uses a plate carrée projection scaled by the cosine of the middle latitude, thins the paths and drops tiny specks. The **charts** (ProgressBar, YearBars, AuroraRing) are hand-built with Views and SVG. YearBars are laid out at full height and grown with `scaleY`, because animating `height` left a stale gradient strip at the base.

### 6.9 Found in your photos (`photoSuggestion.util.ts`)

The search window runs from the start of the journey's first day to the end of its last day, or to _now_ if the trip is ongoing. Photos are sorted by time, and each joins the first group whose first photo is within **1 km and 12 hours**. Up to 6 groups are returned, newest first, each with a cover, a count, a location and an altitude.

### 6.10 On this day

`findOnThisDay` finds a memory with today's month and day from an earlier year, in local time. The most recent year wins, and within a year the earliest time of day. A 29 February memory only matches on 29 February. The result is shown as a card on the Map.

### 6.11 Backup and restore (the hardest piece)

**Export:**

1. Read every row with `getBackupData` (`keepUnusedDataFor: 0`, so nothing stays cached).
2. Check free space.
3. Zip `media/` and `thumbs/` as **inner zips**. The zip library names a folder's contents relative to that folder, so nesting kept the paths clean.
4. Bundle them with `manifest.json` (format name, version 1, export time, app version, row counts) and `data.json` into `atlaslight-backup-<date>.zip` in the cache.
5. Open the system **Save as** dialog. Dismissing it is not an error, and the cached copy is always deleted.

Settings are not included in the backup.

**Restore**, in this order:

1. Pick the file and copy it to the cache.
2. Unpack only the manifest, the rows and the inner zips.
3. Run **`validateBackup`** before anything changes. It checks the format and version, damaged rows (naming the table and row), counts that differ from the manifest, repeated ids, broken references (cover, journey, place, memory, wishlist), unsafe or **zip-slip** paths, and missing media files. A missing thumbnail is allowed and set to null.
4. Show what the backup holds and ask for confirmation.
5. In **one SQLite transaction**, delete all rows and insert the backup's in chunks of 50 (to stay under SQLite's variable limit). Journeys are inserted without covers first, because journeys and media point at each other; the covers are set afterwards.
6. As the **last step before commit**, swap the media folders by renaming (live → `*.old`, staged → live).
7. If anything fails, roll back the transaction and call `undo()` on the swap. **A failed restore leaves the journal and photos exactly as they were.**

The backup row schemas use `satisfies` against the Drizzle row types. Adding a new DB column therefore **fails typecheck** until the backup covers it.

I tested five deliberately broken files: newer version, counts that differ, a missing media file, a zip-slip name and a file that is not a backup. Each showed its own reason and left the data untouched. The tests also found one leak: `keepLocalCopy` created a folder per copy in the cache, which is now cleaned up.

### 6.12 Delete all data

The app first states exactly what will go ("7 journeys, 31 memories, 32 photos…"). Then:

1. Delete rows in one transaction: wishlist, media, stops, journeys, places.
2. Delete the files.
3. `resetApiState`, and reset the Map, Journeys and Stats selections.

Settings stay. The same reset hook is shared with restore.

### 6.13 Demo and test data

- **Load demo journeys:** 7 trips (Spiti Valley, Monsoon in Udaipur, Goa off-season, Rann Utsav, Kerala by train, plus trips abroad), 31 memories and 32 bundled photos. Fixed ids make it **idempotent**: running it again adds nothing.
- **Load 1,000 test memories** (dev builds only): a deterministic generator makes 20 journeys × 50 memories over 40 cities. I used it for the performance pass. There is also _Remove test memories_.

---

## 7. Validation and business rules

These are zod schemas in `validation.util.ts`, used with react-hook-form. Errors show on blur.

- **Journey:** title 1–60 characters (trimmed); start date required; end date ≥ start date, or null (ongoing). Only one ongoing journey: `endOtherOngoing` runs inside the same transaction and either throws or ends the other trip on the new start date (never before that trip's own start).
- **Memory:** title 1–80 characters; location required; latitude and longitude range-checked; altitude between −500 and 9,000 m or null; `visitedAt` required; note up to 2,000 characters; at most 30 media per add. New memories go to the end of the route (`max(orderIndex) + 1`).
- **Delete** always asks first and says what will be removed.
- **Wishlist:** the same name within about 11 km counts as already listed. I added this rule after testing showed Photon returns the same town at slightly different points.
- **Every screen** has empty, loading (skeletons) and error (with retry) states, and errors show in a toast.

---

## 8. Design system

The look comes from an approved design brief (`docs/design-brief.md`). Tokens live in `src/theme/` (`colors`, `typography`, `layout`, `motion`, `mapStyle`, `mapPins`); no raw values appear in components.

- **Mood:** warm, nocturnal, calm, like "a journal opened at night". The app is dark only.
- **Two colour ideas that never swap:** **amber = memory** (pins, visited regions, the primary action, the active tab), and the **aurora teal → violet = motion and measurement** (routes, rings, progress, the live pulse). Violet alone means _wishlist_.
- **Layered surfaces:** `bg #0a0e14`, then `surface`, then `surfaceRaised`, then `surfaceOverlay`. Elevation means a lighter surface first and a shadow second.
- **Three type families, one job each:** _Fraunces_ (serif, journey and memory titles), _Manrope_ (interface), _Space Grotesk_ (numbers, with tabular figures).
- **Motion:** Reanimated springs in `motion.ts` (`standard` for presses and pins, `gentle` for sheets and panels, `pinDrop` with a small overshoot). Pressables scale to 0.97. Lists fade in, timeline rows slide with a `LinearTransition`, and stat numbers count up once over 800 ms.
- **Glass panels** appear only over the map. Icons are Lucide at a 1.75 stroke. There are no emoji, and user photos are never filtered.
- **Copy** is warm and in the second person. Buttons are verbs ("Add memory", "Start journey"). Empty states invite ("No journeys yet — your map is waiting.").

**Shared components** are grouped by purpose in `src/components/`:

- brand (`AppText`, `Icon`)
- buttons (`AppButton`, `IconButton`, `Fab`)
- inputs (`Chip`, `TextField`, `Switch`, `DateField`, `TimeField`)
- surfaces (`Card`, `GlassPanel`, `StatTile`, `AuroraRing`, `AppBottomSheet`, `ConfirmSheet`)
- cards (`JourneyCard`, `MemoryCard`, `Cover`)
- layout (`Screen`, `FormFrame`, `SidePanelFrame`)
- feedback (`Splash`, `EmptyState`, `ErrorBoundary`, `AppToast`, `SkeletonBlock`, `DetailSkeleton`)
- navigation (`TabBar`, `PhoneTabBar`, `TabletRail`)
- map (`AtlasMap`, `StopPins`, `RouteLines`, `MapSheet`, and others)
- charts (`ProgressBar`, `YearBars`, `ScratchMap`, and others)

A dev-only **Kit screen** shows every component, so I could check them on a device with adb screenshots.

---

## 9. Responsive layout

`useWindowClass()` is the **single source of breakpoints**:

- **compact** < 600 dp (phone), **medium** 600–899 dp, **expanded** ≥ 900 dp.
- It also returns `isLandscape`, the screen margin (12/16/24/32 dp), `bottomChrome` (space so content clears the floating tab bar plus the safe-area inset), `gridColumns` (1/2/3) and `statColumns` (2/3/4).

The layout follows the **window size, not the device model**, so split screen and foldables work. `Screen` applies the safe-area insets on all four edges in landscape. Two real bugs came from size changes:

- A closed bottom sheet peeked out empty after a rotation. `MapSheet` and `AppBottomSheet` now remount when the window size changes.
- An Android crash ("Screen fragments should never be restored") on a density or size change. It was fixed by calling `super.onCreate(null)` in `MainActivity`.

I checked the layouts at 360×640, 390×844, 430×932, 800×1280, 840×900 and 1280×800, using `adb shell wm size` on a physical tablet.

---

## 10. Code conventions

- **Naming:** screens, components and navigators, and their folders, use PascalCase (`screens/JourneysScreen/index.tsx` + `style.ts` + `subcomponents/`). Everything else uses camelCase with a role suffix: `.api.ts`, `.service.ts`, `.util.ts` (with `.util.test.ts` beside it), `.types.ts`, `xSlice.ts`, `useX.ts`.
- **Imports:** only `./x`, `../x` or `@/…`, with at most two levels after `@/`. Deeper folders get an `index.ts` barrel. No `../../`.
- **Arrow functions** for components, hooks and helpers (enforced by ESLint). The error boundary stays a class.
- **No `useContext`**, no `any`, no unexplained `!` or `as`, and no `eslint-disable` or `@ts-ignore`.
- Comments explain _why_. Exported functions have JSDoc.
- **Git:** `main` (stable) and `development` (integration), with `feature/<name>` branches.

---

## 11. Testing and quality

- **281 Jest tests**, all on pure logic: EXIF parsing, geo and distance, regions, map features, map search, stats, scratch map, backup format and validation, journey rules, validation schemas, photo grouping, On this day, formatting, Photon parsing, grids, wishlist, and the demo and performance seed generators.
- Jest runs in a Node environment with the `@/` alias and **no React Native preset**, so it is fast. To make that possible, enums like `MOODS` and `MEDIA_TYPES` live in plain files (`src/db/moods.ts`, `src/db/enums.ts`) that Jest can load without native or ESM dependencies.
- **No component or E2E tests**, by design. UI was checked on real devices with adb screenshots at six window sizes.
- Every phase ended with a final check: `tsc --noEmit` clean, ESLint 0 errors, all tests passing, `db:generate` reporting nothing to migrate, and on-device screenshots.

---

## 12. Performance (measured, release build)

Measured on an Android tablet (90 Hz) with Hermes and R8, holding **1,031 memories in 27 journeys**:

| What                                                  | Result                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| Cold start (`am start -W`, 5 runs)                    | median **514 ms**                                          |
| APK size (arm64 only)                                 | **50.7 MB**                                                |
| Map pins query                                        | **108 ms** (debug: 205 ms)                                 |
| Stats data read, then region lookups                  | 66 ms, then 249 ms on the first run, **3 ms** afterwards   |
| `computeStats`                                        | **15 ms** (debug: 204 ms)                                  |
| Map pan at world zoom, 1,031 pins + clusters + routes | **11.1 ms/frame** median, 11.2 ms p99 (at the 90 Hz limit) |
| Journeys grid scroll                                  | 718 frames, **0.7 % janky**, p99 28 ms                     |

Tools: `adb shell am start -W` for start-up, `dumpsys gfxinfo` for list frames, `dumpsys SurfaceFlinger --latency` for the map surface, and temporary timing logs around queries (removed afterwards). What made it fast: native clustering, thumbnails only (no full image decoded for a pin or grid cell), at most 40 photo pins, FlashList, and keeping the region lookups between refetches.

---

## 13. Release and shipping

- **Signed release APK** with my own keystore, which stays outside the repo (`*.jks` is git-ignored). `build.gradle` reads four `ATLASLIGHT_*` properties from the Gradle user home and falls back to the debug key with a warning when they are missing.
- **R8 minification and resource shrinking** are on. No extra keep rules were needed: the release build ran with no missing-class errors.
- Built for **arm64-v8a only**, which gives a small APK for every modern device.
- **One dark splash:** the Android 12+ system splash, the pre-12 window background and the in-app JS `Splash` all show the same icon on `colors.bg`. They match to within a pixel, and there is no white flash. This needed no bootsplash library.
- **Offline check:** with Wi-Fi and data off, the Map draws the bundled regions, pins and routes, and Stats and Journeys work.
- The README has screenshots, install steps, the measured numbers, and data sources with licences: OpenFreeMap and Photon (OSM data, ODbL), Natural Earth (public domain), MapLibre (MIT), Lucide (ISC), and the fonts (SIL OFL).

---

## 14. Privacy and permissions

- No analytics. No network call carries user data, except the typed search text or one coordinate pair sent to Photon.
- Location is "while using" only, requested on tap, never in the background, and never stored.
- Android permissions: camera, `READ_MEDIA_IMAGES`/`VIDEO`, `READ_MEDIA_VISUAL_USER_SELECTED` (partial access works), `ACCESS_MEDIA_LOCATION` (without it EXIF GPS is stripped), and fine/coarse location.

---

## 15. How I ran the project

I built it in **7 phases, each split into numbered checkpoints**, tracked in `docs/PROGRESS.md` with a decisions log and an honest progress log of what was and was not checked:

1. **Foundation:** rename, remove backend/auth, reshape the store and navigation, apply conventions, Jest.
2. **UI kit + shell:** design-system components, tab bar and rail.
3. **Journeys & memories:** CRUD, forms, media, EXIF, Photon, demo data.
4. **Map:** MapLibre, pins and clusters, regions, routes, live location, On this day, replay.
5. **Stats:** maths with tests, charts, scratch map. Mid-phase, the scope changed to world-only stats for v1, and I removed the India-specific logic cleanly.
6. **Settings & data:** settings, backup and restore, wishlist, delete all.
7. **Polish & ship:** state and motion audit, skeletons, a 1,000-memory performance pass, splash, signed R8 release, README.

New dependencies were added **in batches, per phase, only when needed**, after checking New Architecture support. I used Claude Code as an AI pair programmer under strict project rules (`CLAUDE.md`, `docs/AI_TOOLING.md`). I made the decisions and reviewed each checkpoint before the next one began.

---

## 16. Hard bugs I solved (good interview stories)

1. **Migrations re-ran on every launch.** op-sqlite 19 returns `{ rawRows }` from `executeRaw`, but Drizzle 0.45 expects a plain array, so Drizzle saw no applied migrations and every select read nothing. I fixed it with a small adapter in `src/db/client.ts`.
2. **The bottom sheet blocked all touches.** The library's backdrop stayed mounted while the sheet was closed. `AppBottomSheet` now mounts the backdrop only while the sheet is open.
3. **Photo GPS disappeared.** The Android system picker strips location from photos. I switched to camera-roll with `ACCESS_MEDIA_LOCATION` for the GPS-based suggestions.
4. **Crash on density or size change** ("Screen fragments should never be restored"). Fixed with `super.onCreate(null)` in `MainActivity`.
5. **Tapping a cluster flew to the wrong city** (once to Riyadh at street zoom). The camera now centres on the cluster's own coordinates instead of the press point.
6. **Stats blocked the JS thread for 605 ms on every refetch.** I cached the region lookups across calls, which brought a refetch down to 3 ms.
7. **Drizzle correlated subqueries became `id = id`.** I wrote those subqueries in plain SQL and documented why.
8. **Duplicate wishlist towns.** Photon returned the same town at slightly different points, so I added the "same name within about 11 km" rule.
9. **RTK Query rejected `{ data: undefined }`** from a mutation in development. The mutation now returns `{ id }`.

---

## 17. Honest limitations and what I would do next

**Open items (known, documented in PROGRESS.md):**

- **Load demo journeys fails in the current release APK.** Resource shrinking removes the `demo_*.jpg` drawables, which are opened by name. A fix is in `AndroidManifest.xml` (two `<meta-data>` entries that reference the photos), but it has not been built or verified yet. The fallback is `shrinkResources false`. Restoring a backup works in release.
- The latest JS fixes (sheet remount, cluster centre, the removal of Reduce Motion handling) passed typecheck, lint and tests but are not yet in a rebuilt APK.
- **Not tested:** iOS (it compiles in principle), a real phone (I used a tablet with simulated phone sizes), Android 7–11, and camera, video and live location on the release build.
- The source and licence of the demo photos and the app icon still need to be recorded, and the project has no licence file yet.

**Next steps:** verify the release fix; shareable recap cards (`react-native-view-shot`); auto-import trips from the whole photo library (the grouping logic already exists); custom offline tile packs; iOS polish; a Play Store release. Sync and accounts are explicitly out of scope for v1.

---

## 18. Run it yourself

```bash
yarn install
yarn start        # Metro
yarn android      # build and run on a connected device
yarn test         # 281 pure-logic tests
yarn typecheck    # tsc --noEmit
yarn lint         # ESLint
yarn db:generate  # Drizzle migration after a schema change
```

Then open **Settings → Load demo journeys** and go to the Map.
