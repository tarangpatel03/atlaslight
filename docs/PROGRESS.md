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
| 1.11 | Final check: lint, typecheck, tests, device boot                           | in progress |

### Phase 2: UI kit + shell

Planned later.

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

| Decision                                                                                                                  | Why                                              |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Spec section 3 overrides the boilerplate docs (no backend/auth, RTK Query over SQLite, Jest for pure logic only)          | Approved in project-spec.md                      |
| Drop spec section 11 item about stray `src/exif.ts` and `src/stopsApi.ts`                                                 | The files do not exist                           |
| Barrels are allowed. Imports must be absolute (`@/`) everywhere except `./` and `../` inside the same folder; `src/theme/index.ts` and `src/db/schema/index.ts` stay | Owner decision; CLAUDE.md and CONVENTIONS.md change in 1.10 |
| Move `DatabaseProvider.tsx` from `src/app/providers/` to `src/db/`                                                        | Matches spec section 4                           |
| Add `Fraunces-Medium.ttf` to `src/assets/fonts/` and keep the `fonts.displayMedium` token (owner supplies the file)       | Owner decision                                   |
| First dependency batch: image-resizer, react-native-fs, create-thumbnail, image-crop-picker, jest, @types/jest (to confirm in 1.7) | Only what existing code needs; rest waits for its phase |

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
