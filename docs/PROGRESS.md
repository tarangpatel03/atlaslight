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

Planned later.

### Phase 4: Map

Planned later.

### Phase 5: Stats

Planned later.

### Phase 6: Settings & data

Planned later.

### Phase 7: Polish & ship

Planned later.

## Decisions log

| Decision                                                                                                                                                   | Why                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Spec section 3 overrides the boilerplate docs (no backend/auth, RTK Query over SQLite, Jest for pure logic only)                                           | Approved in project-spec.md                                 |
| Drop spec section 11 item about stray `src/exif.ts` and `src/stopsApi.ts`                                                                                  | The files do not exist                                      |
| Imports: only `./<name>`, `../<name>` and `@/` with at most two levels (`@/theme/colors`, `@/components/buttons`); deeper folders get an `index.ts` barrel | Owner decision; CLAUDE.md and CONVENTIONS.md change in 1.10 |
| Move `DatabaseProvider.tsx` from `src/app/providers/` to `src/db/`                                                                                         | Matches spec section 4                                      |
| Add `Fraunces-Medium.ttf` to `src/assets/fonts/` and keep the `fonts.displayMedium` token (owner supplies the file)                                        | Owner decision                                              |
| First dependency batch: image-resizer, react-native-fs, create-thumbnail, image-crop-picker, jest, @types/jest (to confirm in 1.7)                         | Only what existing code needs; rest waits for its phase     |
| Dev-only Kit screen (registered only in **DEV**) to verify Phase 2 components with adb screenshots                                                         | Owner decision                                              |
| No haptics: react-native-haptic-feedback removed; Press = scale only | Owner decision (2.2) |
| react-native-gesture-handler pinned to 2.33.1 (not 3.x) | Owner decision (2.7), made while chasing a blocked-touch bug. The real cause was the sheet backdrop (fixed in AppBottomSheet); 3.x was never retested, so the pin may not be needed |
| Fixed 1x font scale: allowFontScaling={false} on AppText and TextField; brief and spec updated | Owner decision (2.10) |

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
