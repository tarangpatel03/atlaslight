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
| 1.2  | Remove backend, auth and example code and their dependencies              | todo   |
| 1.3  | Reshape store and navigation (baseApi, settings slice, no auth gate)       | todo   |
| 1.4  | Move src/features/\* into the target layout (spec section 4)               | todo   |
| 1.5  | Convert moved code to conventions (arrow functions, no `!`/`as`, JSDoc)    | todo   |
| 1.6  | Fix remaining spec section 11 items (theme barrel kept, useLayout, fonts)  | todo   |
| 1.7  | Approve first dependency batch (ask first)                                 | todo   |
| 1.8  | Install approved batch and link native modules, rebuild                    | todo   |
| 1.9  | Set up Jest for pure logic (exif tests)                                    | todo   |
| 1.10 | Update CLAUDE.md, ARCHITECTURE, CONVENTIONS, ADDING_A_FEATURE, README      | todo   |
| 1.11 | Final check: lint, typecheck, tests, device boot                           | todo   |

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
