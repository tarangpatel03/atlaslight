# Project rules

This is a boilerplate (React Native CLI, frontend only). Placeholder name `BoilerApp`. When a real project starts, rename it (see README.md) and update docs/design-brief.md.

Stack:

- Language: TypeScript (strict)
- Framework: React Native CLI (Android and iOS)
- State: Redux Toolkit (client/UI state), TanStack Query (server state)
- HTTP: axios
- Package manager: yarn

## If docs and code disagree, ask; never assume

When docs, this file, rules, skills or comments disagree with the code (or with each other), stop and ask which one is correct. Do not pick one yourself.

## Reporting (keep output tiny)

- Read docs/ARCHITECTURE.md and docs/CONVENTIONS.md before any feature work.
- After finishing a task, reply with ONE short line, e.g. `Login issue fixed. Please review.`
- No code blocks, diffs, file lists, recaps or explanations unless I ask ("explain", "details", "why").
- Exception: add ONE extra line only if you changed something outside the request, skipped a check, or found a risk I must know about.
- Blocked or need a decision: ask ONE short question.
- Don't narrate between tool calls. Don't echo code back.

## Multi-step goals (checkpoints)

- Break the goal into numbered checkpoints (1.1, 1.2, ...) and show the list first. Wait for my OK. Progress is tracked in docs/PROGRESS.md.
- After each checkpoint, stop and reply exactly: `Checkpoint 1.3 done. Proceed to 1.4 (<name>)?`
- Do not start the next checkpoint until I say yes. Do not commit unless I ask.

## Code changes

- File names: screens, components and navigators are PascalCase, and so are their folders (`screens/LoginScreen/`, `components/buttons/AppButton.tsx`, `Navigation/RootNavigator.tsx`). Grouping folders (`components/buttons/`, `components/feedback/`) and everything else are camelCase with a role suffix (`.types.ts`, `.api.ts`, `.util.ts`, `.store.ts`). A file with no peers stays flat. Details in docs/CONVENTIONS.md.
- Imports are absolute: `@/` points at `src/` (babel `module-resolver` + tsconfig `paths`). No barrel files; import direct paths.
- React and React Native code (components, hooks, handlers, helpers) uses arrow functions (`export const Foo = (): ReactNode => {}`), not `function` declarations. ESLint enforces it. Error boundaries stay classes.
- **Never use `useContext`.** Shared state lives in Redux (typed hooks `useAppDispatch` and `useAppSelector` from `@/store/hooks`). Server state lives in TanStack Query. ESLint enforces it.
- Never hardcode route names, API paths or query keys. Use the central constants and add new ones there first: screens in `src/Navigation/routes.ts`, API paths in `src/api/routes.ts`, query keys in `src/api/queryKeys.ts` (built with `createQueryKeys`).
- Screens never call axios directly: screen, then query hook (`src/hooks/`), then fetcher (`src/api/*.api.ts`), then the axios client.
- Make the smallest change that solves the task. No refactors, renames, reordering or cleanup I didn't ask for.
- No new dependencies, abstractions or config for hypothetical needs. Ask before adding any dependency.
- Match the patterns already used in the file/folder.
- If the request is ambiguous, ask before coding.
- TypeScript: no `any` (use `unknown` and narrow). No `!` non-null assertions or `as` casts without a one-line reason. Explicit return types on exported functions.
- Comments explain why, not what. Exported functions/classes get short JSDoc.
- Files and snippets marked `// EXAMPLE: delete or replace` are patterns to copy, not product code.
- When setup, env vars or behavior change, update the README in the same change. `.env.example` stays current.
- Never read or write `.env` files. Only `.env.example`.
- Before using a library API you are unsure about, check current docs (Context7 if available) instead of guessing.
- Ask before changing tsconfig.
- Do not create test files, add tests, or run extra review passes unless I ask.

## Formatting is not your job

- Write code naturally. Never hand-format (quotes, commas, wrapping, import order, whitespace).
- A hook runs ESLint --fix and Prettier on every file you edit. If it reports errors, fix the cause in the code.
- Never add `eslint-disable`, `@ts-ignore`, `@ts-expect-error` or `prettier-ignore`.
- Never edit ESLint or Prettier config files. Ask me.

## UI work

- Before any UI work, load the skills `ui-design-quality` and `rn-responsive-ui`.
- Read `docs/design-brief.md` first. If it is still the empty boilerplate template, ask me for the content. Do not invent a visual style; the tokens in `src/theme/` are neutral placeholders.
- `docs/design-brief.md` overrides any style defaults from skills or plugins.
- Check the result with adb screenshots before reporting done.

## Folder structure

```
App.tsx, index.js          entry
src/
  api/          routes.ts, queryKeys.ts, one <name>.api.ts per resource
    client/       axiosClient.ts, queryClient.ts
    types/        api.types.ts (envelope), <name>.types.ts per resource
  auth/         token storage (Keychain)
  components/   shared UI, grouped by purpose (buttons/, inputs/, feedback/, layout/, brand/)
  config/       app.config.ts (reads API_URL from the environment file)
  hooks/        query hooks, useWindowClass, usePressScale
  Navigation/   RootNavigator, AppNavigation, routes.ts, navigation.types.ts
  screens/      <Name>Screen/index.tsx assembles the components, style.ts holds its styles
                (+ subcomponents/ for parts only that screen uses)
  store/        store.ts, hooks.ts (typed hooks)
    slices/       one <name>Slice.ts per concern
  theme/        design tokens (colors, layout, typography, elevation, motion)
  utils/        helpers
```

## How to add a feature

Follow docs/ADDING_A_FEATURE.md. Short version: add the endpoint to `src/api/routes.ts`, the types to `src/api/types/<name>.types.ts`, a fetcher in `src/api/<name>.api.ts`, query keys in `queryKeys.ts`, a hook in `src/hooks/`, the screen in `src/screens/<Name>Screen/`, its name in `src/Navigation/routes.ts` and `navigation.types.ts`, and register it in `RootNavigator.tsx`. Copy the pattern from the `// EXAMPLE` files.

## Docs

- docs/ARCHITECTURE.md: layers, data flow, state rules, auth flow
- docs/CONVENTIONS.md: naming, imports, query keys, response shapes, git branches
- docs/ADDING_A_FEATURE.md: step-by-step recipes
- docs/PROGRESS.md and docs/PLANNING_TEMPLATE.md: checkpoint tracking and planning
- docs/AI_TOOLING.md: skills, MCP servers and the workflow
- docs/design-brief.md: visual direction (empty in the boilerplate)

## Checkpoint workflow

- "Plan checkpoint X.Y": read the docs above and any skill relevant to the work. Plan only that checkpoint. List manual steps I must do. Show the plan and wait for my approval.
- "Proceed with checkpoint X.Y": follow the plan I approved in this conversation. If there is no approved plan, say so and stop. Do only that checkpoint, then reply with the checkpoint line.
