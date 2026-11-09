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

Planned later.

### Phase 5: Stats

Planned later.

### Phase 6: Settings & data

Planned later.

### Phase 7: Polish & ship

Planned later.

## Decisions log

| Decision                                                                                                                                                   | Why                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec section 3 overrides the boilerplate docs (no backend/auth, RTK Query over SQLite, Jest for pure logic only)                                           | Approved in project-spec.md                                                                                                                                                         |
| Drop spec section 11 item about stray `src/exif.ts` and `src/stopsApi.ts`                                                                                  | The files do not exist                                                                                                                                                              |
| Imports: only `./<name>`, `../<name>` and `@/` with at most two levels (`@/theme/colors`, `@/components/buttons`); deeper folders get an `index.ts` barrel | Owner decision; CLAUDE.md and CONVENTIONS.md change in 1.10                                                                                                                         |
| Move `DatabaseProvider.tsx` from `src/app/providers/` to `src/db/`                                                                                         | Matches spec section 4                                                                                                                                                              |
| Add `Fraunces-Medium.ttf` to `src/assets/fonts/` and keep the `fonts.displayMedium` token (owner supplies the file)                                        | Owner decision                                                                                                                                                                      |
| First dependency batch: image-resizer, react-native-fs, create-thumbnail, image-crop-picker, jest, @types/jest (to confirm in 1.7)                         | Only what existing code needs; rest waits for its phase                                                                                                                             |
| Dev-only Kit screen (registered only in **DEV**) to verify Phase 2 components with adb screenshots                                                         | Owner decision                                                                                                                                                                      |
| No haptics: react-native-haptic-feedback removed; Press = scale only                                                                                       | Owner decision (2.2)                                                                                                                                                                |
| react-native-gesture-handler pinned to 2.33.1 (not 3.x)                                                                                                    | Owner decision (2.7), made while chasing a blocked-touch bug. The real cause was the sheet backdrop (fixed in AppBottomSheet); 3.x was never retested, so the pin may not be needed |
| Fixed 1x font scale: allowFontScaling={false} on AppText and TextField; brief and spec updated                                                             | Owner decision (2.10)                                                                                                                                                               |
| Demo seed and Load demo journeys in Phase 3 (spec), not Phase 6 (old comment in assets/demo)                                                               | Owner decision (Phase 3 plan)                                                                                                                                                       |
| Map parts (route map, Replay route, mini map, map pick, current location) move to Phase 4; Phase 3 reserves their slots                                    | Owner decision (Phase 3 plan)                                                                                                                                                       |
| Timeline reorder uses react-native-reorderable-list                                                                                                        | Owner decision (Phase 3 plan)                                                                                                                                                       |
| Journey color is auto-assigned from a token palette; no picker                                                                                             | Owner decision (Phase 3 plan)                                                                                                                                                       |

## Progress log

- Plan approved; checkpoint list written.
- 1.1 done: renamed to Atlaslight (com.atlaslight); docs rename text left for 1.10.
- 1.2 done: backend/auth/example code and 4 deps removed; tsc only fails on missing @types/jest until 1.8.
- 1.3 done: store has baseApi + persisted settings slice; app opens into PlaceholderScreen (no auth).
- 1.4 done: features/ moved to api/, services/, utils/, db/; tags in api/tags.ts. Remaining tsc errors: missing packages and @types/jest (1.8).
- 1.5 done: moved code uses arrow functions, no `!`/`as` casts, return types. Left: 3 dev-only console warnings; useLayout.ts lint errors go away in 1.6.
- 1.6 done: useLayout and breakpoints removed; layout values in useWindowClass; theme barrel kept; font file present.
- 1.7 done: first batch approved (4 media packages, jest, @types/jest).
- 1.8 done: 6 packages installed and autolinked; media permissions added (Android manifest, iOS Info.plist); tsc passes. Rebuild pending (manual).
- 1.9 done: Jest (node env, @/ alias, no RN preset); `yarn test` runs the 10 exif tests, all pass.
- 1.10 done: CLAUDE.md, ARCHITECTURE, CONVENTIONS, ADDING_A_FEATURE, README, SETUP.md match spec section 3.
- 1.11 in progress: lint (0 errors), typecheck and 10 tests pass; device boot not verified (build could not start from my shell).
- Phase 2 plan approved; 2.1-2.10 added.
- 2.1 done: installed bottom-tabs, gesture-handler, gorhom bottom-sheet, svg, lucide, haptic-feedback; App root wrapped in GestureHandlerRootView; tsc, lint (0 errors) and 10 tests pass. Rebuild and device boot pending (manual); bottom-sheet on Reanimated 4 unverified until 2.7.
- 2.2 done: Icon (curated Lucide set) and dev-only Kit screen (dev builds open on it); haptics dropped (package removed, docs updated; native rebuild pending, manual). Fixed DB: op-sqlite 19 returns `{ rawRows }` from `executeRaw`, drizzle 0.45 expects an array, so migrations reran each launch; adapter added in `src/db/client.ts`. Checked on tablet only (phone width and 130% font not checked).
- 2.3 done: AppButton variants (primary, secondary, ghost, danger, icon, loading keeps width), IconButton, Fab; shown in Kit. Checked on tablet only (130% font and pressed state not checked).
- 2.4 done: Chip (default, selected, wish, live with aurora outline, static status) and Switch (amber, spring thumb, Reduce Motion jump) in components/inputs; shown in Kit. Checked on tablet only (130% font not checked).
- 2.5 done: TextField on design tokens (surfaceRaised, radius md, constant border, amber focus, danger error with icon, hint, leading icon, disabled, multiline); added `alert` icon; shown in Kit. Checked on tablet only (130% font not checked; keyboard overlap is a screen concern for Phase 3).
- 2.6 done: components/surfaces (Card, GlassPanel, AuroraRing, StatTile) and hooks/useCountUp; shown in Kit. Checked on tablet only (count-up mid-frame, pressed card and 130% font not checked).
- 2.7 in progress: AppBottomSheet written and shown in Kit; with gesture-handler 3.5 the closed sheet swallowed touches (page stopped scrolling), so gesture-handler is pinned to 2.33.1 (owner decision). Rebuild (manual) and device check pending.
- 2.7 done: AppBottomSheet (glass/solid, backdrop, Reduce Motion) works on gesture-handler 2.33.1 + Reanimated 4: opens, drags to second snap point, swipe-down and backdrop-tap close, page scrolls with sheets mounted. The sheet mounts the backdrop only while open (library's closed backdrop blocked touches). Checked on tablet only (keyboard inside sheet and 130% font not checked).
- 2.8 done: components/cards (JourneyCard hero/row, MemoryCard timeline row, shared Cover with scrim and no-cover block), utils/format.util (+8 tests), heart icon, image module typings (src/assets/images.d.ts), assets/demo barrel; shown in Kit with the two demo photos. Checked on tablet only (pressed state and 130% font not checked).
- 2.9 done: one tab navigator (Map, Journeys, Stats, Settings) with a floating phone tab bar and a tablet rail (FAB on top, Settings at the bottom) chosen by useWindowClass; placeholder tab screens; PlaceholderScreen removed; dev builds reach the Kit from Settings. Rail and tab navigation checked on the tablet; the phone bar was checked only by temporarily forcing it on the tablet (not on a real phone); 130% font not checked.
- 2.10 done: tsc, eslint (0 errors, 3 existing no-console warnings) and 18 tests pass; font scale fixed at 1x. 1.11 closed (device boots). Checked on the 1200x1920 tablet: native landscape and portrait (rail) and phone widths 360, 390 and 430 dp (floating tab bar; Kit cards, rings, controls at 360). Not checked: foldable and 800x1280 dp (need a bigger panel), a real phone, sheets and the keyboard at phone width, pressed states, count-up mid-frame. prettier --check flags 18 files (not touched).
- Phase 3 plan approved; 3.1-3.13 added.
- 3.1 done: installed flash-list, react-hook-form, zod, resolvers, date-fns, react-native-video 6, fast-image, reorderable-list, @turf/distance, datetimepicker; @turf/length dropped (distance sums give the same total); gesture-handler still 2.33.1; tsc, lint (0 errors) and 18 tests pass. Rebuild (manual) pending.
- 3.2 done: journey.util, geo.util (turf), validation.util (zod), formatRelativeDay and JOURNEY_COLORS (existing tokens); MOODS moved to src/db/moods.ts (re-exported from schema/stops) so Jest can load validation without uuid ESM; tsc, lint (0 errors) and 49 tests pass.
- 3.3 done: journeys.api counts via subqueries (stop, photo, video), cover falls back to the first photo of the first memory, auto color on create, one-ongoing guard with endCurrentOngoing (other journey ends on the new start date); checked on the tablet (guard, counts, cover fallback, cleanup); tsc and lint (0 errors) pass.
- 3.4 done: photon.util (+6 tests), geocoding.service (Photon search and reverse, User-Agent, 8 s timeout) and places.api (searchPlaces, savePlace, cache-first resolvePlace stored at the asked-for point); checked on the tablet (search, reverse, cache hit, no duplicate rows, cleanup); tsc, lint (0 errors) and 55 tests pass. A reverse lookup that finds nothing is not cached.
- 3.5 done: 7 demo journeys (31 memories, 32 photos) from src/db/seed/demoJourneys.ts (+ data tests), demo photos linked with react-native-asset (src/assets/demo/photos, copied with copyFileRes), demoAssets.service, demo.api loadDemoJourneys (idempotent by fixed ids), Load demo journeys button in Settings; checked on the tablet (7 added, second tap adds 0, every cover file exists, one ongoing); tsc, lint (0 errors) and 73 tests pass. Release build and iOS not checked. Debug build done from my shell with android/gradlew.
- 3.7 done: Journeys on wide windows: card grid (columns from the measured pane width) and, from the expanded size, a 400 dp side panel (cover, Stops/Photos/Km/Days, 3 latest memories, Open journey); selection in journeysUi slice and falls back when a filter hides it; medium width (tablet portrait) shows the grid only; Screen gets a `padded` prop; Cover gets `scrimColor`; hero card shows the Ongoing badge on the photo (phone too); util tests added (96 pass), tsc and lint (0 errors) pass. Checked on the tablet in landscape and portrait and at 390 dp (display size and rotation restored). No Map button or search (Phase 4 / owner decision); presses are placeholder toasts until 3.9.
- 3.10 done: Memory form (new / edit / delete) as a full screen on phones and a dialog on tablets: journey chips, photo strip (library, camera, remove, first = cover), title, Photon place search (debounced, cached via savePlace) with photo GPS as a bonus, date and time fields, mood chips, note; entry from Journey detail, the rail +, and a timeline row (temporary edit entry until 3.12); FormFrame moved to components/layout and lifts the dialog above the keyboard; MemoryCard text no longer loses its last word on Android; memory.util (+5 tests, 106 pass), tsc and lint (0 errors) pass. Checked on tablet and at 390 dp (add, edit with photo, delete, validation, keyboard). Photo GPS is blanked by the Android photo picker on this tablet, so search is the working path; Found in your photos stays for 3.11.
- 3.11 done: Found in your photos card in the memory form (Look in my photos -> permission -> places grouped from the journey's days with real photo GPS via @react-native-camera-roll/camera-roll 7.10.2 (new native dep, rebuilt) -> tap fills place, date and time and names the point); denied, limited-access, nothing-found states; util photoSuggestion (+7 tests, 113 pass), tsc and lint (0 errors) pass. Photon search was already done in 3.10. Checked on tablet landscape (limited access, suggestion, save, delete, empty window); display left at default. Denied state seen before the limited-access fix, phone width and iOS not rechecked.
- 3.12 done: Memory detail (phone full screen, tablet 400 dp right-hand panel over the journey via new SidePanelFrame): swipeable media pager (photos, videos with native controls that play only on their page), journey/title/date, mood, note, place card with coordinates and a reserved mini map slot, thumbnail grid that jumps the pager, Edit (opens the form) and Delete with confirm; opened from the timeline and from the Journeys side panel; memory.util +2 tests (115 pass), tsc and lint (0 errors) pass. Checked on tablet landscape and at 390 dp (photos, video added and played, delete); display restored. Pager uses RN Image: @d11/react-native-fast-image's style types do not compile against RN 0.88.
- 3.13 done: tsc clean, eslint 0 errors (3 old no-console warnings), 115 tests pass; Journeys, Journey detail, New memory and Memory detail checked on the device at 360x640, 390x844 (earlier), 430x932, 800x1280, 840x900 and 1280x800 (journey form dialog and keyboard on phone and tablet seen in 3.8 and 3.10); nothing needed fixing in layout. MainActivity now calls super.onCreate(null), so a density or size change no longer crashes with "Screen fragments should never be restored" (the app restarts at the Map tab). Display, density and rotation restored. Left: the dev-only yellow Reanimated warning comes from @gorhom/bottom-sheet; prettier --check flags 50 older files (not reformatted).
