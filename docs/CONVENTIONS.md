# Conventions

## Naming

- **PascalCase:** screens, components, navigators, and their folders. Examples: `screens/JourneysScreen/index.tsx`, `components/buttons/AppButton.tsx`, `Navigation/RootNavigator.tsx`.
- **camelCase with a role suffix:** everything else. Suffixes: `.api.ts` (RTK Query endpoints for one resource), `.service.ts` (side-effecting device and IO code), `.types.ts`, `.util.ts` (pure helpers; tests are `.util.test.ts` beside them), `useX.ts` for hooks, `xSlice.ts` for Redux slices. Config files keep their tool names.
- **Folders:** grouping folders are camelCase and named for a purpose (`components/buttons/`, `components/feedback/`). A file with no peers stays flat. Screen folders hold `index.tsx` (assembles the components; `.tsx` because it contains JSX), `style.ts` (the screen's `styles`, imported by `index.tsx` as `import { styles } from './style'`; a screen never uses another screen's styles) and `subcomponents/` for parts used by that screen only; a subcomponent with parts of its own gets its own `subcomponents/`.
- **Constants:** screen names `SCREENS` in `src/Navigation/routes.ts`; cache tag names `TAGS` in `src/api/tags.ts`.

## Code style

- Arrow functions for components, hooks, handlers and helpers: `export const Foo = (): ReactNode => {}`. Error boundaries are classes.
- Explicit return types on exported functions. No `any`; use `unknown` and narrow. No `!` assertions or `as` casts without a one-line reason.
- Comments say why, not what. Exported functions get short JSDoc.
- Never add `eslint-disable`, `@ts-ignore` or `@ts-expect-error`.
- Formatting belongs to Prettier and ESLint; do not hand-format.

## Imports

Absolute, from `@/` (= `src/`): `import { colors } from '@/theme/colors'`. Set in `babel.config.js` (module-resolver) and `tsconfig.json` (`paths`); change both together. Barrel (`index.ts`) files are allowed (`theme/index.ts`, `db/schema/index.ts`), but import them only through `@/` paths, never through `./` or `../`. A relative `./` import is fine for a plain sibling file such as `./style`.

## Cache tags

RTK Query tags are the `TAGS` constants in `src/api/tags.ts`. Queries `providesTags` with `{ type: TAGS.X, id }` plus `{ type: TAGS.X, id: 'LIST' }` for lists; mutations `invalidatesTags` the same. Never write a tag string inline.

## Data shapes

- Keys are camelCase, ids are UUID strings, timestamps are epoch milliseconds (numbers, not Date objects).
- Types come from Drizzle (`typeof table.$inferSelect` and `$inferInsert`, exported from `src/db/schema/`). Endpoint input types live next to their endpoints.

## Tests

Jest, pure logic only (`yarn test`): EXIF parsing, trip grouping, stats math, geo helpers. Files are `<name>.util.test.ts` next to the util. No component or E2E tests.

## Git

- Branches: `main` (stable) and `development` (integration). Work on feature branches from `development` (`feature/<name>`), merge back into `development`, and merge `development` into `main` for releases.
- Commit only when asked; keep messages short and in the imperative.
