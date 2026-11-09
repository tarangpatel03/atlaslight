# Atlaslight — project spec

Source of truth for WHAT the app does and the decisions that change the boilerplate.
`docs/design-brief.md` is the source of truth for HOW it looks.
If this spec, the docs and the code disagree, ask; never assume.

## 1. Product

**Atlaslight** is an offline-first travel journal: record journeys, attach memories (photos, videos,
notes, moods) to places, and watch one dark world map fill with amber pins and aurora routes.

- **Purpose:** portfolio project for React Native roles. It must run with zero setup for a reviewer
  (demo data in one tap) and show real engineering: local database, media handling, maps, performance,
  responsive phone + tablet layouts, smooth motion.
- **Users:** one person on their own phone or tablet. No accounts, no login, no backend, no sync.
- **Platforms:** Android first (physical phone + physical tablet, Windows dev machine). iOS must
  compile in principle but is not tested.
- **Data never leaves the device**, except map tiles and place lookups (section 9).

## 2. Scope

### v1 (in)

1. Journeys: create, edit, delete, favourite; one may be "ongoing" (no end date).
2. Memories (stops): create with photos/videos from library or camera, location, date/time, mood,
   note; edit, add/remove media, delete; drag to reorder the route.
3. "Found in your photos": prefill location and time from photo EXIF.
4. Map: dark custom style, amber dot pins (world zoom), photo pins and clusters (zoomed in),
   visited countries/states filled amber, aurora route lines, live location, wishlist pins.
5. Journey detail: cover, stats, route map with **Replay route**, timeline.
6. Memory detail: photo/video pager, place + coordinates, mood, note, media grid, mini map.
7. Stats: distance, countries, Indian states & UTs, journeys per year, most visited states,
   % of India, highest point, scratch map (India / World).
8. Wishlist: places to visit, shown as violet pins.
9. On this day: a memory from the same date in a past year, on the map screen.
10. Settings: backup export/import (.zip), suggest trips from photos toggle, map toggles, units,
    permissions shortcuts, **Load demo journeys**, delete all.
11. Phone and tablet layouts (section 6), portrait and landscape, foldables, split screen.

### Later (not v1)

Auto-import trips from the whole photo library (v1 has the toggle and the grouping logic only if
time allows), shareable recap cards, cloud sync, accounts, multiple users, iOS polish, light theme,
custom MapLibre offline tile packs, Play Store release.

## 3. Decisions that change the boilerplate

The boilerplate assumes a REST backend. Atlaslight has none. These decisions override
CLAUDE.md, ARCHITECTURE.md, CONVENTIONS.md and ADDING_A_FEATURE.md; Phase 1 updates those docs to match.

| Boilerplate                                           | Atlaslight                                                                                                                                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TanStack Query + axios for server state               | **Removed.** Data lives in SQLite. Reads/writes go through **RTK Query with `queryFn`** over the local DB (`baseApi`), which gives caching, loading/error states and tag invalidation.             |
| Keychain token, login screen, auth slice, 401 handler | **Removed.** No auth. App opens straight into the tabs.                                                                                                                                            |
| `react-native-config` + `.env` (`API_URL`)            | **Removed** (no env values needed). `.env` / `.env.example` deleted.                                                                                                                               |
| `src/api/` = axios client, `ENDPOINTS`, query keys    | `src/api/` = RTK Query endpoint files over the DB. Tag names are constants in `src/api/tags.ts`; never inline tag strings.                                                                         |
| Query hook files in `src/hooks/`                      | Screens import the generated RTK Query hooks straight from `src/api/<name>.api.ts`. `src/hooks/` keeps non-data hooks only.                                                                        |
| Example files (`// EXAMPLE`)                          | Deleted once their patterns are copied.                                                                                                                                                            |
| AsyncStorage + redux-persist                          | **Kept** for UI/settings slices only (not MMKV).                                                                                                                                                   |
| `useWindowClass` is the only breakpoint source        | **Kept.** `src/theme/useLayout.ts` and `breakpoints` in `src/theme/layout.ts` are duplicates and are removed; any extra layout values (bottom chrome, grid columns) are added to `useWindowClass`. |
| "No tests unless asked"                               | Unit tests (Jest) are wanted for **pure logic only**: EXIF parsing, trip grouping, stats math, geo helpers. No component or E2E tests.                                                             |
| No barrel files                                       | Still applies: `src/theme/index.ts` is removed; import `@/theme/colors` etc. directly.                                                                                                             |

## 4. Architecture

```
Screen (src/screens/<Name>Screen)          layout, local state, Redux selectors
  -> RTK Query hook (from src/api/*.api.ts) caching, loading/error, tag invalidation
    -> queryFn + runDb()                    typed result or { error }
      -> Drizzle ORM (src/db)               typed SQL
        -> op-sqlite (journeys.db)          on-device SQLite, WAL, foreign keys ON
Media files -> src/services/mediaStorage.service.ts -> app documents directory
```

### Target folder layout (after Phase 1)

```
src/
  api/          baseApi.ts, tags.ts, journeys.api.ts, stops.api.ts, places.api.ts,
                wishlist.api.ts, stats.api.ts, backup.api.ts
  components/   shared UI grouped by purpose (brand/, buttons/, inputs/, feedback/, layout/,
                surfaces/, cards/, map/, media/, navigation/, charts/)
  db/           client.ts, columns.ts, schema/*.ts, migrations/ (generated), seed/,
                DatabaseProvider.tsx
  hooks/        useWindowClass.ts, usePressScale.ts, other non-data hooks
  Navigation/   RootNavigator, tabs (phone) / rail (tablet), routes.ts, navigation.types.ts
  screens/      <Name>Screen/index.tsx + style.ts (+ subcomponents/)
  services/     mediaStorage.service.ts, picker.service.ts, geocoding.service.ts,
                backup.service.ts, location.service.ts
  store/        store.ts, hooks.ts, slices/ (settingsSlice, mapSlice)
  theme/        colors.ts, typography.ts, layout.ts, motion.ts, mapStyle.ts
  utils/        exif.util.ts (+ .test.ts), geo.util.ts, stats.util.ts, tripGrouping.util.ts,
                format.util.ts, toast.util.ts
  assets/       fonts/, geo/ (countries + India states GeoJSON), demo/ (demo photos)
```

`src/features/*` from the first code drop is moved into this layout in Phase 1. File names follow
CONVENTIONS.md (`.api.ts`, `.service.ts` (new suffix: side-effecting device/IO code), `.util.ts`).

## 5. Data model (SQLite via Drizzle)

Already implemented in `src/db/schema/` with migration `0000`. IDs are UUID strings; timestamps are
epoch milliseconds (numbers, not Date objects, so Redux stays serializable).

| Table              | Key fields                                                                                                                                                          | Notes                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `journeys`         | id, title, description, coverMediaId → media (set null), color, startDate, endDate (null = ongoing), isFavorite, createdAt, updatedAt                               |                                     |
| `stops` (memories) | id, journeyId → journeys (cascade), placeId → places (set null), latitude, longitude, title, note, mood, visitedAt, orderIndex                                      | `orderIndex` = route order          |
| `media`            | id, stopId → stops (cascade), type photo/video, filePath, thumbnailPath, width, height, durationMs, takenAt, latitude, longitude, sourceAssetId (unique), sortOrder | paths RELATIVE to the documents dir |
| `places`           | id, name, locality, adminArea, countryCode, countryName, latitude, longitude, source photon/manual/exif                                                             | reverse-geocode cache               |
| `wishlist`         | id, placeId → places (unique, cascade), note                                                                                                                        |                                     |

Moods: `happy, calm, adventurous, romantic, nostalgic, tired`.

Not stored (computed): countries/states visited, distance, % explored, stats.
Settings live in a persisted Redux `settingsSlice`, not SQLite.

Media on disk: `media/<journeyId>/<mediaId>.<ext>`, thumbnails `thumbs/<journeyId>/<mediaId>.jpg`
(480 px long edge). Files are copied before the DB write and removed if the write fails; rows are
deleted before files.

## 6. Screens

Layout comes from `useWindowClass`: **compact** (< 600) = phone, **medium/expanded** (≥ 600) = tablet.

| Screen                              | Phone                                                                                                                                | Tablet                                                          | Data                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Map (home)                          | full map, glass search, filter chips, locate/fit buttons, On this day card, FAB, floating tab bar; pin tap → bottom sheet            | nav rail + map + 400 px side panel with the selected memory     | stops with coords + cover thumbs, visited regions, wishlist, live location |
| Journeys                            | ongoing card, then compact rows grouped by year, filter chips, FAB                                                                   | 2-column card grid + side panel preview of the selected journey | journeys with counts + cover                                               |
| Journey detail                      | cover hero, 4 stats, route map + Replay route, description, timeline (reorder), bottom bar Share recap (later) + Add memory          | hero band, route map and timeline side by side                  | journey, stops, route                                                      |
| Memory detail                       | photo/video pager, place card, mood chips, note, media grid, mini map, Edit/Delete                                                   | shown in the side panel                                         | stop + place + media                                                       |
| Add / edit memory                   | full screen form: journey selector, photo strip (first = cover), Found in your photos, title, location, date, time, mood, note, Save | centred dialog over the current screen                          | picked media, places search                                                |
| New / edit journey                  | form: title, description, start/end (ongoing toggle), cover                                                                          | dialog                                                          | —                                                                          |
| Stats                               | headline, distance + Earth progress, % India ring, tiles, scratch map, journeys per year, most visited                               | 3-column dashboard                                              | computed                                                                   |
| Settings                            | profile, backup & data, map, permissions, feel, about (Load demo journeys, source link, version), Delete all                         | in the side panel / centred column                              | settings slice, DB size                                                    |
| Wishlist (from map chip / settings) | list + add place                                                                                                                     | side panel                                                      | wishlist + places                                                          |

Visual reference: the approved Atlaslight phone and tablet designs (see design-brief.md). Match them.

## 7. Rules and validation

- **Journey:** title 1–60 chars (trimmed); `startDate` required; `endDate` ≥ `startDate` or null.
  At most ONE ongoing journey: starting a new ongoing journey asks to end the current one.
- **Memory:** title 1–80 chars; location required (from photo EXIF, search, map pick or current
  location); `visitedAt` required; note ≤ 2,000 chars; up to 30 media per add. New memories append
  to the end of the route.
- **Media:** photos are compressed to ≤ 2560 px JPEG; videos are copied as-is. A failed thumbnail is
  not fatal (fall back to the full image). The first media item is the cover.
- **Deleting** a journey or memory always asks for confirmation and states what is removed
  ("Deletes 9 memories and 214 photos from this phone").
- **Distances:** great-circle (Turf) along the route order, summed per journey. Units km (miles setting).
- **Regions:** country and Indian state for a stop come from the bundled GeoJSON (point-in-polygon),
  not from the network, so stats work offline.
- **Forms:** react-hook-form + zod; errors shown on blur, never on every keystroke.
- **Empty, loading and error states** on every screen. Errors surface through `showToast`.

## 8. Non-functional

- **Offline-first:** everything except tiles and place search works with no network.
- **Performance:** map stays smooth with 1,000+ pins (clustering, thumbnails only); lists use
  FlashList; no full-size image is decoded for a pin or grid cell. Measure and note numbers in README.
- **Startup:** DB pragmas + migrations behind `DatabaseProvider`; splash until ready.
- **Privacy:** no analytics, no network calls with user data. Location permission "while using" only.
- **Permissions (Android):** camera, READ_MEDIA_IMAGES/VIDEO, READ_MEDIA_VISUAL_USER_SELECTED (partial
  access must work), ACCESS_MEDIA_LOCATION (else EXIF GPS is stripped), fine/coarse location.

## 9. External services (free, no keys)

| Service         | Use                                                                   | Rules                                                                                                  |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| OpenFreeMap     | vector tiles + glyphs for the custom style in `src/theme/mapStyle.ts` | verify the URLs against `https://tiles.openfreemap.org/styles/dark`                                    |
| Photon (komoot) | place search and reverse geocoding                                    | fair use: debounce search (400 ms), cache every result in `places`, never look up the same point twice |

## 10. Libraries

**Already in package.json:** RN 0.88.1, React 19.3, Redux Toolkit 2, react-redux, redux-persist +
AsyncStorage, React Navigation 7 (native stack), Reanimated 4 + worklets, safe-area-context,
react-native-screens, toast-message, op-sqlite, drizzle-orm (+ drizzle-kit), uuid +
get-random-values, react-native-asset.

**To add (ask before each batch, per CLAUDE.md):**

- Navigation & UI: `@react-navigation/bottom-tabs`, `react-native-gesture-handler`,
  `@gorhom/bottom-sheet`, `@shopify/flash-list`, `react-native-svg`, `lucide-react-native`,
  `react-native-linear-gradient`
- Forms: `react-hook-form`, `zod`, `@hookform/resolvers`
- Map & geo: `@maplibre/maplibre-react-native`, `supercluster`, `@turf/distance`, `@turf/length`,
  `@turf/boolean-point-in-polygon`, `@react-native-community/geolocation`, `react-native-permissions`
- Media: `react-native-image-crop-picker`, `@dr.pogodin/react-native-fs`,
  `react-native-create-thumbnail`, `@bam.tech/react-native-image-resizer`, `react-native-video`,
  `@d11/react-native-fast-image`, `@react-native-camera-roll/camera-roll` (photo-library scan)
- Stats: `react-native-gifted-charts`
- Backup & share: `react-native-zip-archive`, `@react-native-documents/picker`, `react-native-share`,
  `react-native-view-shot` (recap cards, later)
- Dates: `date-fns`
- Tests: `jest`, `@types/jest` (pure-logic tests only)

**Removed:** `@tanstack/react-query`, `axios`, `react-native-keychain`, `react-native-config`.

Every native module must support the New Architecture; check before installing (Context7 / docs).

## 11. Known issues in the current code (fix in Phase 1)

- `src/exif.ts` actually contains `journeysApi` code and `src/stopsApi.ts` contains picker code:
  stray copies from an earlier paste. Delete both; the real files are under `src/features/`.
- `src/theme/index.ts` is a barrel (not allowed) and its comment still says `@/shared/theme`.
- `src/theme/useLayout.ts` duplicates `useWindowClass`.
- `fonts.displayMedium` points at `Fraunces-Medium`, which is not in `src/assets/fonts/`. Either add
  the file or remove the token (no style uses it).
- The first code drop uses `function` declarations, a few `!` assertions and `as` casts; convert to
  the conventions (arrow functions, narrowing) while moving the files.
- Media packages used by `src/features/media/services/` are not installed yet, so typecheck will fail
  until Phase 1 installs them.

## 12. Phases (checkpoints are planned in docs/PROGRESS.md)

1. **Foundation:** rename the app to Atlaslight (`com.atlaslight`); remove backend/auth/example code
   and deps; move the data layer and media services into the target layout; fix section 11; update
   CLAUDE.md and docs to match section 3; install the first dependency batch; Jest for pure logic.
2. **UI kit + shell:** components from the design system (AppText variants, buttons incl. FAB and
   icon button, Chip, TextField, Switch, cards, stat tile, glass panel, bottom sheet); phone tab bar
   and tablet nav rail; placeholder screens wired.
3. **Journeys & memories:** demo seed data + Load demo journeys; Journeys list; new/edit journey;
   journey detail + timeline + reorder; add/edit memory with picker, EXIF suggestion and Photon search;
   memory detail with video.
4. **Map:** MapLibre with the custom style; dots → photo pins → clusters; visited regions; side
   panel / sheet; routes; Replay route; live location; On this day.
5. **Stats:** stats utils (tested); Stats screen with charts and scratch map.
6. **Settings & data:** settings slice + screen; backup export/import; wishlist; delete all.
7. **Polish & ship:** motion, empty states,
   performance pass with 1,000 pins, app icon + splash, README with GIF and numbers, release APK.
