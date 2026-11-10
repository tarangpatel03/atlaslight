# Atlaslight

An offline-first travel journal. Record journeys, attach memories (photos, videos, notes, moods) to places, and watch one dark world map fill with amber pins and aurora routes. Everything is stored on the device: no backend, no accounts, no sync. Portfolio project for React Native roles. What it does: [docs/project-spec.md](docs/project-spec.md).

## Stack

| Part     | Choice                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| App      | React Native 0.88.1 (new architecture, Hermes), React 19.3.0                                                    |
| Language | TypeScript 5.9.3, strict                                                                                        |
| Data     | SQLite (op-sqlite) + Drizzle ORM, read and written through RTK Query (`queryFn`)                                |
| State    | Redux Toolkit 2 + react-redux 9 + redux-persist 6 (UI and settings state)                                       |
| Navigate | React Navigation 7 (native stack + bottom tabs)                                                                 |
| Storage  | AsyncStorage 3 (persisted settings), app documents directory (media files)                                      |
| Media    | react-native-image-crop-picker, camera-roll (photo locations), react-native-fs, create-thumbnail, image-resizer |
| UI       | reanimated 4, gesture-handler, gorhom bottom-sheet, svg, lucide icons                                           |
| Lists    | FlashList 2, react-native-reorderable-list (timeline drag reorder)                                              |
| Forms    | react-hook-form + zod, datetimepicker, date-fns                                                                 |
| Viewing  | react-native-video 6, fast-image (photo and video display), @turf/distance                                      |
| Tests    | Jest (pure logic only)                                                                                          |
| Tooling  | ESLint 9 (flat config) + Prettier 3, `@/` absolute imports (babel module-resolver)                              |
| Package  | Yarn classic (1.x), Node >= 22.11                                                                               |

## Setup from zero (Windows 11, Android physical phone)

1. Install Node 22 LTS, Yarn classic (`npm i -g yarn`), JDK 17, Android Studio, and Git.
2. In Android Studio's SDK Manager install: Android SDK Platform 37, Build-Tools 37.0.0, NDK 27.1.12297006, Platform-Tools. Set `ANDROID_HOME` to the SDK folder and add `platform-tools` to `PATH`.
3. On the phone: enable Developer options, turn on USB debugging, connect over USB and accept the prompt. Check with `adb devices`.
4. `yarn install`
5. `yarn start` in one terminal (Metro), `yarn android` in another. No environment file is needed.

The Settings tab has **Load demo journeys**: it adds 7 sample journeys with photos (run it again and nothing is duplicated). In the memory form, **Found in your photos** asks for photo access (and photo locations) the first time it is used; the system photo picker hides GPS, so places come from that card or from place search. Dev builds add an **Open UI kit** button to the Settings tab (`src/screens/KitScreen`), a gallery of the UI components; release builds do not include it.

The Map tab uses MapLibre with OpenFreeMap vector tiles (no API key). Tiles need a network connection the first time; the map shows no attribution button (owner decision). Journey detail shows the journey's own route map (`components/map/JourneyRouteMap.tsx`); Replay route redraws the line over 6 seconds. The map there is fixed (no pan or zoom, so it never fights the page scroll); tap a dot to open the memory. Memory detail has a small fixed map of the place. In the memory form the place can come from search, **My location** (one position fix, asked only when you tap it) or **Pick on map** (`screens/MapPickScreen`: pan the map under the fixed mark, then Use this spot).

After adding a native module, a font or a demo photo, rebuild with `yarn android`; a Metro reload is not enough. Fonts live in `src/assets/fonts/` and the demo photos in `src/assets/demo/photos/` (lowercase `demo_<name>.jpg`, one flat resource namespace); both are linked with `npx react-native-asset`. iOS (Mac only): `bundle install`, `cd ios && bundle exec pod install`, then `yarn ios`. The iOS project has not been built.

## Map data

Visited countries and Indian states/UTs are worked out on the device from two bundled files in `src/assets/geo/` (point-in-polygon, no network), so they work offline from the first launch:

- `countries.json`: [Natural Earth](https://www.naturalearthdata.com/) 1:50m admin-0 countries (public domain), reduced to `{ iso2, name }`. Natural Earth marks France and Norway `-99`; `ISO_A2_EH` is used for those, and Somaliland, N. Cyprus and Siachen Glacier are mapped to SO, CY and IN by hand.
- `indiaStates.json`: Natural Earth 1:10m admin-1, India only (36 states and union territories, including Ladakh), reduced to `{ name }`. Natural Earth draws borders in its default de facto view.

Both are simplified to keep them small (about 470 KB and 85 KB). To regenerate (for example after a new Natural Earth release): download `ne_50m_admin_0_countries.geojson` and `ne_10m_admin_1_states_provinces.geojson` from the [natural-earth-vector](https://github.com/nvkelso/natural-earth-vector) repo, keep only the properties above (India = features with `iso_a2 = IN`), then run `npx mapshaper <in>.geojson -simplify 25% keep-shapes -o countries.json format=geojson precision=0.001` (15% for the India file). Nothing is downloaded by the app.

The Stats scratch map draws the countries file as SVG (world only), so it works offline too.

## Live location

Location is asked only when you tap the Locate button on the Map, and only while the app is open: the position is followed while the Map tab is showing and the GPS stops when you leave it. There is no background location, nothing is stored and nothing leaves the device. Permissions are `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION` (Android manifest) and the location text in `Info.plist`; the code is `src/services/location.service.ts`.

A memory can also keep its height above sea level (metres, optional). It comes from a photo's EXIF, from the photo library, or from a Locate fix in the memory form, and it stays on the device; the Stats screen uses it for your highest point.

## Stats

The Stats tab is worked out on the device from your journeys and memories, with no network. `src/utils/stats.util.ts` holds the maths (tested); `src/api/stats.api.ts` reads the data and looks up each memory's country once per change. Stats is world-only for version 1: no per-country or India-specific numbers.

- **Distance** is the great-circle length along each journey's route order, summed over journeys. The Earth bar compares it with 40,075 km; the unit follows the km / mi setting.
- **Countries** come from the bundled countries file (see Map data).
- **Year chips**: a journey counts for the year it starts in. "+N this year" counts countries first visited in that year, measured against every memory ever.
- **Highest point** is the highest memory that has an altitude (see Live location); the tile is hidden when none does.
- **Layouts**: windows 900 dp and wider get a 2-column dashboard, narrower ones a single column (centred and capped at 640 dp).

## Database

Schema is in `src/db/schema/`. After a schema change run `yarn db:generate`, which writes a migration into `src/db/migrations/`; `DatabaseProvider` applies migrations at startup. After the first generate or a migration change, restart Metro with `yarn start --reset-cache`.

## Scripts

| Script              | What it does                 |
| ------------------- | ---------------------------- |
| `yarn start`        | Metro bundler                |
| `yarn android`      | Build and run on Android     |
| `yarn ios`          | Build and run on iOS         |
| `yarn lint`         | ESLint                       |
| `yarn typecheck`    | `tsc --noEmit`               |
| `yarn test`         | Jest (pure-logic tests)      |
| `yarn db:generate`  | Generate a Drizzle migration |
| `yarn format`       | Prettier write               |
| `yarn format:check` | Prettier check               |

## Docs

- [docs/project-spec.md](docs/project-spec.md): what the app does, data model, screens, rules, phases
- [docs/design-brief.md](docs/design-brief.md): visual direction
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): layers, data flow, state rules
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md): naming, imports, tags, git
- [docs/ADDING_A_FEATURE.md](docs/ADDING_A_FEATURE.md): recipe for a new screen with data
- [docs/PROGRESS.md](docs/PROGRESS.md), [docs/PLANNING_TEMPLATE.md](docs/PLANNING_TEMPLATE.md): planning and tracking
- [docs/AI_TOOLING.md](docs/AI_TOOLING.md): Claude Code skills, MCP servers, workflow
