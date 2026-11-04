# Conventions

## Naming

- **PascalCase:** screens, components, navigators, and their folders. Examples: `screens/LoginScreen/index.tsx`, `components/buttons/AppButton.tsx`, `Navigation/RootNavigator.tsx`.
- **camelCase with a role suffix:** everything else. Suffixes: `.api.ts` (one fetcher file per resource), `.types.ts`, `.util.ts`, `.store.ts`, `useX.ts` for hooks, `xSlice.ts` for Redux slices. Config files keep their tool names.
- **Folders:** grouping folders are camelCase and named for a purpose (`components/buttons/`, `components/feedback/`). A file with no peers stays flat. Screen folders hold `index.tsx` (assembles the components; `.tsx` because it contains JSX), `style.ts` (the screen's `styles`, imported by `index.tsx` as `import { styles } from './style'`; a screen never uses another screen's styles) and `subcomponents/` for parts used by that screen only; a subcomponent with parts of its own gets its own `subcomponents/`.
- **Constants:** screen names `SCREENS` in `src/Navigation/routes.ts`; API paths `ENDPOINTS` in `src/api/routes.ts`; query keys in `src/api/queryKeys.ts`.

## Code style

- Arrow functions for components, hooks, handlers and helpers: `export const Foo = (): ReactNode => {}`. Error boundaries are classes.
- Explicit return types on exported functions. No `any`; use `unknown` and narrow. No `!` assertions or `as` casts without a one-line reason.
- Comments say why, not what. Exported functions get short JSDoc.
- Never add `eslint-disable`, `@ts-ignore` or `@ts-expect-error`.
- Formatting belongs to Prettier and ESLint; do not hand-format.

## Imports

Absolute, from `@/` (= `src/`): `import { colors } from '@/theme/colors'`. Set in `babel.config.js` (module-resolver) and `tsconfig.json` (`paths`); change both together. No barrel (`index.ts`) files, except the `index.tsx` that is a screen's component.

## Query keys

Build keys with `createQueryKeys('<entity>')` (`src/utils/queryKeyFactory.util.ts`) in `src/api/queryKeys.ts`. It gives `all`, `lists()`, `list(filters)`, `details()` and `detail(id)`. Invalidate `all` or `lists()` after a write. Never write a key array inline.

## DTO and response shapes

- JSON keys are camelCase, timestamps are ISO-8601 UTC strings, ids are UUID strings.
- Success: `{ success: true, data, meta? }`, where `meta` is `{ page, limit, total, totalPages }` on lists.
- Error: `{ success: false, statusCode, error, message, details?: { field, messages[] }[], path, timestamp }`.
- Types for request and response bodies live in `src/api/types/<name>.types.ts` and mirror the backend DTOs.

## Environment

Values come from `.env` through `react-native-config` and are read only in `src/config/app.config.ts`. Add each new variable to `.env.example`. Never read or commit `.env`.

## Git

- Branches: `main` (stable) and `development` (integration). Work on feature branches from `development` (`feature/<name>`), merge back into `development`, and merge `development` into `main` for releases.
- Commit only when asked; keep messages short and in the imperative.
