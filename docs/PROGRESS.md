# Progress

## Working agreement

- Claude breaks the goal into numbered checkpoints (1.1, 1.2, ...) and shows the list first. Wait for approval.
- After each checkpoint Claude stops and replies exactly: `Checkpoint X.Y done. Proceed to X.Z (<name>)?` and waits for a yes.
- Claude does not start the next checkpoint, and does not commit, until told to.
- Status values: `todo`, `in progress`, `done`, `blocked`.
- After each checkpoint, Claude updates its status here and adds one short line to the Progress log at the end.

## Goal

Atlaslight: an offline-first travel journal (portfolio app). Journeys and memories live in on-device SQLite and show as pins and routes on a dark map, with phone and tablet layouts. Spec: docs/project-spec.md.

## Phases and checkpoints

### Phase 1: Foundation

| #    | Checkpoint                                                                 | Status |
| ---- | -------------------------------------------------------------------------- | ------ |
| 1.1  | Rename to Atlaslight (com.atlaslight)                                      | done   |
| 1.2  | Remove backend, auth and example code and their dependencies              | done   |
| 1.3  | Reshape store and navigation (baseApi, settings slice, no auth gate)       | done   |
| 1.4  | Move src/features/\* into the target layout (spec section 4)               | done   |
| 1.5  | Convert moved code to conventions (arrow functions, no `!`/`as`, JSDoc)    | done   |
| 1.6  | Fix remaining spec section 11 items (theme barrel kept, useLayout, fonts)  | done   |
| 1.7  | Approve first dependency batch (ask first)                                 | done   |
| 1.8  | Install approved batch and link native modules, rebuild                    | done   |
| 1.9  | Set up Jest for pure logic (exif tests)                                    | done   |
| 1.10 | Update CLAUDE.md, ARCHITECTURE, CONVENTIONS, ADDING_A_FEATURE, README      | done   |
| 1.11 | Final check: lint, typecheck, tests, device boot                           | done   |

### Phase 2: UI kit + shell

| #    | Checkpoint                                                             | Status |
| ---- | ---------------------------------------------------------------------- | ------ |
| 2.1  | Approve and install dependency batch 2 (navigation, sheet, svg, icons) | done   |
| 2.2  | Foundations: Icon, dev-only Kit screen                                 | done   |
| 2.3  | Buttons: AppButton variants, IconButton, Fab                           | done   |
| 2.4  | Chip and Switch                                                        | done   |
| 2.5  | TextField aligned to the design system                                 | done   |
| 2.6  | Surfaces: GlassPanel, Card, StatTile, AuroraRing                       | done   |
| 2.7  | AppBottomSheet                                                         | done   |
| 2.8  | JourneyCard and MemoryCard                                             | done   |
| 2.9  | Navigation shell: phone tab bar, tablet rail, placeholder tabs         | done   |
| 2.10 | Final check: lint, typecheck, tests, screenshots at all sizes          | done   |

### Phase 3: Journeys & memories

| #    | Checkpoint                                                                                              | Status |
| ---- | ------------------------------------------------------------------------------------------------------- | ------ |
| 3.1  | Approve and install dependency batch 3 (lists, forms, dates, video, images, reorder, turf, date picker) | done   |
| 3.2  | Pure logic + tests: journey util, validation schemas, geo distance, format helpers, palette tokens      | done   |
| 3.3  | Journeys API additions: auto color, ongoing guard, delete summary, list counts                          | done   |
| 3.4  | Places: geocoding service (Photon) and places API with cache                                            | done   |
| 3.5  | Demo seed + Load demo journeys in Settings                                                              | done   |
| 3.6  | Journeys screen, phone                                                                                  | done   |
| 3.7  | Journeys screen, tablet (grid + side panel)                                                             | done   |
| 3.8  | New / edit journey (full screen / dialog), delete with confirm                                          | done   |
| 3.9  | Journey detail + timeline + reorder (map slot reserved)                                                 | done   |
| 3.10 | Add / edit memory: form and media                                                                       | done   |
| 3.11 | Add / edit memory: Found in your photos + Photon search                                                 | done   |
| 3.12 | Memory detail with photo/video pager (mini map slot reserved)                                           | done   |
| 3.13 | Final check: lint, typecheck, tests, screenshots at all sizes                                           | done   |

### Phase 4: Map

| #    | Checkpoint                                                                            | Status |
| ---- | ------------------------------------------------------------------------------------- | ------ |
| 4.1  | Approve and install dependency batch 4 (maplibre, turf pip, geolocation, permissions) | done   |
| 4.2  | Map style live (OpenFreeMap URLs verified, MapView on the Map tab)                    | done   |
| 4.3  | Region data + logic + tests (countries + India states GeoJSON, map features)          | done   |
| 4.4  | Map data API + mapSlice                                                               | done   |
| 4.5  | Pins and clusters (MapPin variants, dots, photo pins, clusters)                       | done   |
| 4.6  | Visited regions + aurora routes                                                       | done   |
| 4.7  | Map screen chrome, phone (search, chips, locate/fit, FAB, MapSheet)                   | done   |
| 4.8  | Map screen, tablet (rail + map + 400 dp side panel)                                   | done   |
| 4.9  | Live location (location service, pulse pin, locate, denied state)                     | done   |
| 4.10 | On this day (util + tests, card on the Map screen)                                    | done   |
| 4.11 | Journey route map + Replay route                                                      | done   |
| 4.12 | Mini map + map pick + current location in memory form                                 | done   |
| 4.13 | Final check: lint, typecheck, tests, screenshots at all sizes                         | done   |

### Phase 5: Stats

| #   | Checkpoint                                                                                    | Status |
| --- | --------------------------------------------------------------------------------------------- | ------ |
| 5.1 | Altitude: stops.altitude + migration, EXIF GPSAltitude (+tests), form sources, demo altitudes | done   |
| 5.2 | Stats math + tests (stats.util)                                                               | done   |
| 5.3 | Stats API + statsUi slice (year chip)                                                         | done   |
| 5.4 | Stats components (ProgressBar, YearBars, RankedList, StatTile sub line) in the Kit            | done   |
| 5.5 | Scratch map (scratchMap.util + tests, SVG ScratchMap with India / World toggle)               | done   |
| 5.6 | Stats screen, phone                                                                           | done   |
| 5.7 | Stats screen, tablet (3-column dashboard)                                                     | done   |
| 5.8 | Final check: lint, typecheck, tests, screenshots at all sizes, docs                           | done   |
| 5.9 | Remove India stats from the logic: states, % of India, newest state, most visited (stats.util + tests); scratch map world only (scratchMap.util + tests) | done   |
| 5.10 | Stats screen: remove India ring, Most visited, India/World toggle and their components; world-only scratch map with a "N countries" caption; tablet becomes two columns; Kit cleanup | done   |
| 5.11 | Docs (spec item 7 and Stats row, README Stats section) + final check: lint, typecheck, tests, phone and tablet screenshots | done   |

### Phase 6: Settings & data

Planned later.

### Phase 7: Polish & ship

Planned later.

## Decisions log

Owner decisions unless noted.

- **Architecture:** spec section 3 overrides the boilerplate docs (no backend/auth, RTK Query over SQLite, Jest for pure logic only). `DatabaseProvider.tsx` lives in `src/db/` (spec 4). Spec 11 item about stray `src/exif.ts` / `src/stopsApi.ts` dropped (files never existed).
- **Imports:** only `./`, `../` and `@/` with at most two levels; deeper folders get an `index.ts` barrel.
- **Fonts:** `Fraunces-Medium.ttf` added, `fonts.displayMedium` kept. Fixed 1x font scale (`allowFontScaling={false}` on AppText and TextField) (2.10).
- **Dependencies:** added per phase only when needed. No haptics (react-native-haptic-feedback removed; press = scale only) (2.2). react-native-gesture-handler pinned to 2.33.1 (2.7); the real blocked-touch cause was the sheet backdrop, 3.x never retested, so the pin may not be needed.
- **Dev:** Kit screen registered only in `__DEV__`, used to check components with adb screenshots.
- **Journeys (Phase 3):** demo seed + Load demo journeys in Phase 3; timeline reorder with react-native-reorderable-list; journey colour auto-assigned from a token palette (no picker); map parts (route map, Replay, mini map, map pick, current location) moved to Phase 4.
- **Map (Phase 4):** region GeoJSON bundled in the app (countries Natural Earth 50m; India states Natural Earth admin-1, public domain, 36 regions incl. Ladakh; sources and licences in README); search covers local memories/journeys first, then Photon; wishlist pins wait for Phase 6 (only the MapPin wish variant exists); no attribution button and no fit-to-memories button (after 4.13).
- **Stats (Phase 5):** highest point from a nullable `stops.altitude` (photo EXIF, camera roll, My location), tile hidden when none; charts hand-built (Views + react-native-svg), no gifted-charts; scratch map is SVG from the bundled GeoJSON (offline); year chips in, Share stats waits for recap cards, "Next on your wishlist" waits for Phase 6.
- **Stats scope change (after 5.8):** Stats shows world-level numbers only for v1: no India ring, states, newest state, most visited or India map; the scratch map is world only; no home-country setting (per-country states were considered and dropped). Checkpoints 5.9-5.11. The Map tab's visited Indian states fill stays.

## Progress log

### Phase 1 (done)

- Renamed to Atlaslight (com.atlaslight); backend, auth and example code removed; store = baseApi + persisted settings slice; `src/features` moved into api/, services/, utils/, db/; code converted to conventions; useLayout and breakpoints removed (layout values in useWindowClass).
- First batch installed (4 media packages, jest, @types/jest); media permissions in the Android manifest and iOS Info.plist; Jest runs in node env with the `@/` alias and no RN preset.
- Docs (CLAUDE.md, ARCHITECTURE, CONVENTIONS, ADDING_A_FEATURE, README, SETUP) match spec section 3.

### Phase 2 (done)

- Installed bottom-tabs, gesture-handler, gorhom bottom-sheet, svg, lucide; App wrapped in GestureHandlerRootView.
- Built: Icon (curated Lucide set), AppButton variants, IconButton, Fab, Chip, Switch, TextField, Card, GlassPanel, AuroraRing, StatTile, useCountUp, AppBottomSheet, JourneyCard, MemoryCard, Cover, format.util; one tab navigator with a floating phone tab bar and a tablet rail chosen by useWindowClass.
- Fixes worth remembering: op-sqlite 19 returns `{ rawRows }` from `executeRaw` but drizzle 0.45 expects an array (migrations reran each launch), adapter in `src/db/client.ts`; AppBottomSheet mounts its backdrop only while open (the library's closed backdrop blocked touches).
- Checked on the 1200x1920 tablet in landscape and portrait and at 360/390/430 dp widths. Not checked: real phone, pressed states, count-up mid-frame.

### Phase 3 (done)

- Installed flash-list, react-hook-form, zod, resolvers, date-fns, react-native-video 6, fast-image, reorderable-list, @turf/distance, datetimepicker, camera-roll 7.10.2 (3.11); @turf/length dropped (distance sums give the same total).
- Built: journey/geo/validation/memory/photon/photoSuggestion utils; journeys.api (counts by subquery, cover falls back to the first photo, auto colour, one-ongoing guard via endCurrentOngoing); geocoding.service + places.api (Photon, User-Agent, 8 s timeout, cache-first resolvePlace; empty reverse results not cached); 7 demo journeys (31 memories, 32 photos, idempotent by fixed ids, photos via react-native-asset); Journeys phone and tablet (grid + 400 dp side panel from expanded); journey form; Journey detail + timeline + reorder; memory form (phone full screen, tablet dialog; FormFrame lifts above the keyboard); Found in your photos (denied, limited-access, nothing-found states); Memory detail with photo/video pager (SidePanelFrame on tablet).
- Gotchas: MOODS live in `src/db/moods.ts` so Jest can load validation without uuid ESM; the Android photo picker blanks photo GPS (camera-roll gives real GPS); @d11/react-native-fast-image style types do not compile on RN 0.88, so the pager uses RN Image; MainActivity calls `super.onCreate(null)` so a density or size change no longer crashes ("Screen fragments should never be restored").
- 115 tests. Checked at 360x640, 390x844, 430x932, 800x1280, 840x900 and 1280x800. Not checked: release build, iOS.

### Phase 4 (done)

- Installed @maplibre/maplibre-react-native 11.5.1, @turf/boolean-point-in-polygon 7.4.0, @react-native-community/geolocation 3.4.0 (react-native-permissions and supercluster skipped).
- Built: AtlasMap with the OpenFreeMap style (URLs verified); bundled geo data (countries.json 468 KB, indiaStates.json 83 KB, simplified with mapshaper); region.util and mapFeatures.util; map.api + mapUi slice (filter, selection, location; not persisted; camera stays in MapLibre); clustered StopPins + photo pins (up to 40 Marker views from zoom 6); VisitedRegions and aurora RouteLines; phone chrome (search, chips, locate, FAB, MapSheet); tablet MapPanel that slides in on pin select (portrait uses the sheet); live location (location.service, useLiveLocation, pulse pin, denied/unavailable notices, watch only while the tab is focused); On this day card; Journey route map + Replay route (fixed map inside the scroll page); MiniMap, MapPick (returns the point via `popTo` with merge), My location in the form.
- Gotchas: photo-pin press bubbled to the map press (stopPropagation); `line-cap` belongs in layout, not paint; opening fit-to-memories must wait for AtlasMap `onLoaded`; MapSheet is remounted on window size change (a closed sheet peeked out empty after rotation).
- 170 tests; eslint 0 errors (3 old no-console warnings); prettier --check flags 45 older files (not reformatted). Checked at all six sizes.
- Not checked: denied-permission toast, a successful My location fix, Open journey on the Map panel, tab-blur stopping the watch, 0/1-memory journeys on the route map, other time zones for On this day, first offline launch with no cached tiles, 1,000-pin performance (Phase 7), iOS. Replay gradient restarts on the drawn part, not the whole route.

### Phase 5

- Plan approved; 5.1-5.8 added.
- 5.1 done: `stops.altitude` (nullable m, migration 0001); `cleanAltitude` and `extractAltitude` (Android rational + ref, iOS nested); altitude flows from photo EXIF (picker), camera roll (Found in your photos) and Locate (My location) into the memory form and `createStop`/`updateStop`; a searched place or map pick clears it; 31 demo stops have altitudes and Load demo journeys backfills already-loaded ones (`added` unchanged). tsc, eslint (0 errors) and 181 tests pass. Checked on the tablet: migration applied with the 31 memories intact, backfill filled 31/31 with no new journeys. Not checked on device: saving a memory with a photo/GPS altitude, clearing on place search. No UI shows altitude yet (5.6).
- 5.2 done: `src/utils/stats.util.ts` — `resolveRegions` (one country/state lookup per memory, ~10 m cell cache) and `computeStats(journeys, stops, filter, now)` returning distance (per journey in route order), Earth fraction, visited countries/states, India fraction (of the bundled 36), newest state, countries new in the year (all-time baseline), journeys, days away, memories, photos, highest point, journeys per year (gap years 0, unaffected by the chip), most visited states (by journeys), first journey, chip years; `bundled` region data now exported from region.util. 22 new tests (203 pass), tsc and eslint (0 errors). No UI or device check. Most visited is states only, so it is empty without Indian trips.
- 5.3 done: `src/api/stats.api.ts` `getStatsData` (journeys, memories with place name, photo count and altitude, regions resolved once inside the `queryFn` so the year chip only reruns `computeStats`; provides `TAGS.Stats` and the Journey LIST tag, the latter because `reorderStops` invalidates only the list) and `statsUi` slice (`filter`: 'all' or a year, not persisted) registered in the store. tsc, eslint (0 errors) and 203 tests pass. Checked on the tablet with a temporary log (removed): 7 journeys, 31 memories, 32 photos, 3 countries (IN, JP, PT), 5 states of 36, 756 km, highest point 4,300 m (Chandratal); `resolveRegions` took about 20 ms; the query reran after Load demo journeys. Seen: two demo memories (Fort Aguada lighthouse, Fort Kochi walk) lie outside the simplified coast shapes and get no region, so a state reached only by such a memory would not count. Not checked on device: refetch after reorder, add and delete (rely on the tags).
- 5.4 done: `components/charts` (AuroraFill, ProgressBar, YearBars, RankedList, barrel) and StatTile `sub` + `labelFirst` (label above a 28 px number, as in the Stats design; the default number-first order stays for Journey detail, whose design is number-first); `formatShortYear` (+1 test, 204 pass); Kit sections for label-first tiles, progress bars, year bars (last 6 years, highlighted year in the aurora, zero years) and the ranked list. No Reduce Motion or accessibility props in the new components (CLAUDE.md). YearBars bars are laid out at final height and grown with scaleY, because animating `height` left a stale-sized gradient strip at the bar's base. tsc and eslint (0 errors). Checked on the tablet in landscape and at 360 dp portrait (display size and density restored). Not checked: 390 and 430 dp, the grow animation mid-motion, iOS. The dev-only yellow Reanimated warning is the known @gorhom/bottom-sheet one.
- 5.5 done: `scratchMap.util` (`fitProjection` plate carrée scaled by cos of the middle latitude, `ringToPath` thinning and dropping specks, `buildScratchPaths` returning two path strings: India's 36 states, or the world's countries without Antarctica, visited vs not) with 16 tests (220 pass); `components/charts/ScratchMap` (SVG on the map-water ground, amber 75% for visited, fade on mode change) and `ScratchMapToggle` (India / World pill); Kit section; README line. tsc and eslint (0 errors). Checked on the tablet in landscape and at 360 dp portrait, India and World, with the demo's visited places (Gujarat, Rajasthan, Himachal Pradesh, Kerala, Goa; India, Japan, Portugal). First build took 70 ms (India, 55 K chars) and 89 ms (world, 206 K chars) on Hermes, once per layout or mode change. The world map is about 2:1, so in a tall card it leaves empty bands: the screen (5.6) should size that card for the mode. Not checked: iOS, a visited state that is tiny (Goa shows as a sliver). Display and density restored.
- 5.6 done: Stats screen, phone: "Since <month>" and "Your world, so far", year chips (All time + years), distance card (count-up, km/mi, aurora bar, "N% of the way around the Earth"), India ring card with newest state, 2x2 label-first tiles (countries with "+N this year"/"in <year>", journeys with days away, memories with photos, highest point hidden without altitudes), scratch map (tap to switch India/World, caption under the map so it never covers a state; world card sized to its shape), journeys per year, most visited (top 3); loading blocks, load error with Try again, and the empty state; no Share button or wishlist line (owner decision). New pure helpers `formatMonthYear`, `formatEarthProgress`, `scratchMapHeight` (+6 tests, 226 pass); tsc and eslint (0 errors). Checked on the device with the demo data at 360 and 390 dp portrait (all time and 2025, India and World; numbers match the 5.3 log; 2025 gives 319 km, 4 journeys, 3 states, 19 memories) and on the tablet in landscape (interim single column). Loading, error and empty states checked by temporarily forcing each in code (reverted). Not checked: 430 dp, miles, an empty database (not wiped on purpose), iOS. The tablet layout is 5.7. Display and density restored.
- 5.7 done: Stats screen, tablet: from 900 dp (expanded) a 3-column dashboard (header row with the year chips beside the title; distance card and Countries/Journeys tiles; scratch map with the India/World toggle and "5 of 36 states & UTs"; compact India ring, Memories/Highest point tiles and journeys per year; most visited top 5 with a footnote), medium (600-899 dp) keeps the phone layout centred at up to 640 dp (owner decision). The screen is now thin: `PhoneLayout` and `WideLayout` hold the layouts; additive props on the 5.6 pieces (`wide`, `compact`, `bleed`, `show`, `style`, `tileBasis`), `StatTile` `basis`, `ScratchMapCard` measures its own width. tsc and eslint (0 errors), 226 tests. Checked on the tablet at its default density (about 1100 dp wide, landscape: all time, 2025, World), at 960 dp landscape and at 800 x 1280 dp portrait; numbers match 5.6; display and density restored. The wide page scrolls by about 180 dp at the default size (the design is drawn to fit 800 dp tall). At 960 dp the Highest point label wraps and its "m" sits at the tile edge. Not checked: miles, an unfolded foldable, iOS.
- 5.8 done: tsc clean, eslint 0 errors (3 old no-console warnings), 226 tests pass, `yarn db:generate` reports nothing to migrate; no leftover logs or forced states. The 6 new Phase 5 files prettier flagged were formatted (`scratchMap.util*`, `YearBars`, `charts/index`, `StatTiles`, `WideLayout`); 12 older tracked files Phase 5 touched are still flagged by `prettier --check` and were left as they are, like the 45 older ones. Docs: spec section 10 charts line (no chart library), README Stats section. Checked on the device with the demo data: Stats at 360x640, 390, 430 (phone column, 2025 chip, India), 800x1280 and 840x900 (centred 640 dp column), 1280x800 (dashboard fits on one screen with no scroll) and the default density; display and density restored. Refetch: adding a memory through the form (Photon search, Jaipur) updated Stats live behind the dialog (32 memories, 2,788 km, Rajasthan 2 trips) and deleting it brought back 31 memories and 757 km; the saved memory had a null altitude after a place search, and the database is back to 7 journeys, 31 memories (all with altitude). Not checked: refetch after a drag-reorder, My location saving an altitude (no mock fix), miles (no Settings yet), World mode at the phone sizes beyond 360, an unfolded foldable beyond 840x900, iOS. Phase 5 done.
- Stats scope change (owner, after 5.8): remove the India-specific stats and keep world only for version 1; 5.9-5.11 added (table above). 5.9 done: `Stats` lost the state fields and most visited, `computeStats` no longer takes region data, scratch map utils are world-only (33 tests pass); typecheck errors remain only in StatsScreen, charts and Kit until 5.10. 5.10 done: India ring, Most visited and the map toggle removed (IndiaCard, MostVisitedCard, ScratchMapToggle deleted); world-only scratch map with an "N countries" caption; tablet is two columns; Kit updated; typecheck, lint and 218 tests clean; checked on the tablet (default size) and a portrait phone-width window (720x1560 at 280 dpi), not on 360x640 or iOS.
- 5.11 done, Phase 5 done: spec item 7, the Stats row and the README Stats section now describe world-only Stats; typecheck clean, lint 0 errors (3 old warnings), 218 tests pass, no schema changes, no stale names. Checked on 360 dp and 430 dp phones, a medium tablet portrait (800 dp) and the wide layout. Not checked: refetch after drag-reorder, My location altitude, the km/mi switch (no Settings yet), iOS. README and spec still fail prettier as they did before Phase 5.
