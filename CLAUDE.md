# Project rules

Atlaslight: an offline-first travel journal (React Native CLI, Android first). No backend, no accounts. docs/project-spec.md says what the app does; docs/design-brief.md says how it looks. If they disagree with the code, ask.

Stack:

- Language: TypeScript (strict)
- Framework: React Native CLI (Android first, iOS compiles in principle)
- Data: SQLite on the device (op-sqlite + Drizzle ORM), read and written through RTK Query (`queryFn` over the local DB)
- State: Redux Toolkit for UI and settings state, persisted with redux-persist + AsyncStorage
- Tests: Jest, for pure logic only
- Package manager: yarn

## If docs and code disagree, ask; never assume

When docs, this file, rules, skills or comments disagree with the code (or with each other), stop and ask which one is correct. Do not pick one yourself.

## Reporting (keep output tiny)

- Read docs/ARCHITECTURE.md and docs/CONVENTIONS.md before any feature work.
- After finishing a task, reply with ONE short line, e.g. `Journey list fixed. Please review.`
- No code blocks, diffs, file lists, recaps or explanations unless I ask ("explain", "details", "why").
- Exception: add ONE extra line only if you changed something outside the request, skipped a check, or found a risk I must know about.
- Blocked or need a decision: ask ONE short question.
- Don't narrate between tool calls. Don't echo code back.

## Multi-step goals (checkpoints)

- Break the goal into numbered checkpoints (1.1, 1.2, ...) and show the list first. Wait for my OK. Progress is tracked in docs/PROGRESS.md.
- After each checkpoint, stop and reply exactly: `Checkpoint 1.3 done. Proceed to 1.4 (<name>)?`
- Do not start the next checkpoint until I say yes. Do not commit unless I ask.

## Code changes

- File names: screens, components and navigators are PascalCase, and so are their folders (`screens/JourneysScreen/`, `components/buttons/AppButton.tsx`, `Navigation/RootNavigator.tsx`). Grouping folders (`components/buttons/`, `components/feedback/`) and everything else are camelCase with a role suffix (`.types.ts`, `.api.ts`, `.service.ts`, `.util.ts`). A file with no peers stays flat. Details in docs/CONVENTIONS.md.
- Imports are absolute: `@/` points at `src/` (babel `module-resolver` + tsconfig `paths`). Barrel files (`index.ts` re-exports, e.g. `theme/index.ts`, `db/schema/index.ts`) are allowed, but import them only through `@/` paths, never through `./` or `../`.
- React and React Native code (components, hooks, handlers, helpers) uses arrow functions (`export const Foo = (): ReactNode => {}`), not `function` declarations. ESLint enforces it. Error boundaries stay classes.
- **Never use `useContext`.** Shared UI state lives in Redux (typed hooks `useAppDispatch` and `useAppSelector` from `@/store/hooks`). Data lives in SQLite and is read through RTK Query hooks. ESLint enforces it.
- Never hardcode route names or cache tag names. Use the central constants and add new ones there first: screens in `src/Navigation/routes.ts`, RTK Query tags in `src/api/tags.ts`.
- Screens never touch the database directly: screen, then the RTK Query hook from `src/api/<name>.api.ts`, then `queryFn` + `runDb()`, then Drizzle (`src/db`). Device and IO code (files, picker, geocoding, backup) lives in `src/services/*.service.ts`.
- Make the smallest change that solves the task. No refactors, renames, reordering or cleanup I didn't ask for.
- No new dependencies, abstractions or config for hypothetical needs. Ask before adding any dependency.
- Match the patterns already used in the file/folder.
- If the request is ambiguous, ask before coding.
- TypeScript: no `any` (use `unknown` and narrow). No `!` non-null assertions or `as` casts without a one-line reason. Explicit return types on exported functions.
- Comments explain why, not what. Exported functions/classes get short JSDoc.
- When setup or behavior changes, update the README in the same change.
- Never read or write `.env` files.
- Before using a library API you are unsure about, check current docs (Context7 if available) instead of guessing.
- Ask before changing tsconfig.
- Tests: Jest for pure logic only (EXIF parsing, trip grouping, stats math, geo helpers), as `*.test.ts` next to the file. No component or E2E tests. Do not run extra review passes unless I ask.

## Formatting is not your job

- Write code naturally. Never hand-format (quotes, commas, wrapping, import order, whitespace).
- A hook runs ESLint --fix and Prettier on every file you edit. If it reports errors, fix the cause in the code.
- Never add `eslint-disable`, `@ts-ignore`, `@ts-expect-error` or `prettier-ignore`.
- Never edit ESLint or Prettier config files. Ask me.

## UI work

- Before any UI work, load the skills `ui-design-quality` and `rn-responsive-ui`.
- Read `docs/design-brief.md` first. Do not invent a visual style; use the Atlaslight tokens in `src/theme/`, never raw values.
- `docs/design-brief.md` overrides any style defaults from skills or plugins.
- Check the result with adb screenshots before reporting done.

## Folder structure

```
App.tsx, index.js          entry
src/
  api/          baseApi.ts, tags.ts, one <name>.api.ts per resource (RTK Query endpoints over the DB)
  components/   shared UI, grouped by purpose (brand/, buttons/, inputs/, feedback/, layout/, ...)
  db/           client.ts, columns.ts, schema/, migrations/ (generated), DatabaseProvider.tsx
  hooks/        useWindowClass, usePressScale, other non-data hooks
  Navigation/   RootNavigator, AppNavigation, routes.ts, navigation.types.ts
  screens/      <Name>Screen/index.tsx assembles the components, style.ts holds its styles
                (+ subcomponents/ for parts only that screen uses)
  services/     <name>.service.ts: device and IO code (media storage, picker, ...)
  store/        store.ts, hooks.ts (typed hooks)
    slices/       one <name>Slice.ts per concern (UI and settings only)
  theme/        design tokens (colors, layout, typography, motion, mapStyle)
  utils/        pure helpers (<name>.util.ts, with <name>.util.test.ts)
  assets/       fonts/, geo/, demo/
```

## How to add a feature

Follow docs/ADDING_A_FEATURE.md. Short version: schema and migration in `src/db`, endpoints in `src/api/<name>.api.ts` (tags in `src/api/tags.ts`), IO code in `src/services/`, the screen in `src/screens/<Name>Screen/`, its name in `src/Navigation/routes.ts` and `navigation.types.ts`, and register it in `RootNavigator.tsx`. Copy the pattern from `src/api/journeys.api.ts`.

## Docs

- docs/project-spec.md: what the app does, data model, screens, rules, phases
- docs/ARCHITECTURE.md: layers, data flow, state rules
- docs/CONVENTIONS.md: naming, imports, tags, git branches
- docs/ADDING_A_FEATURE.md: step-by-step recipe
- docs/PROGRESS.md and docs/PLANNING_TEMPLATE.md: checkpoint tracking and planning
- docs/AI_TOOLING.md: skills, MCP servers and the workflow
- docs/design-brief.md: visual direction (approved)

## Checkpoint workflow

- "Plan checkpoint X.Y": read the docs above and any skill relevant to the work. Plan only that checkpoint. List manual steps I must do. Show the plan and wait for my approval.
- "Proceed with checkpoint X.Y": follow the plan I approved in this conversation. If there is no approved plan, say so and stop. Do only that checkpoint, then reply with the checkpoint line.
