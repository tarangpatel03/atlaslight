# Architecture

Atlaslight is offline-first: no backend, no accounts. Everything lives in SQLite on the device. What the app does is in [project-spec.md](project-spec.md).

## Layers

```
Screen (src/screens/<Name>Screen)          layout, local state, Redux selectors
  -> RTK Query hook (from src/api/*.api.ts) caching, loading/error, tag invalidation
    -> queryFn + runDb()                    typed result or { error }
      -> Drizzle ORM (src/db)               typed SQL
        -> op-sqlite (journeys.db)          on-device SQLite, WAL, foreign keys ON
Media files -> src/services/mediaStorage.service.ts -> app documents directory
```

Shared pieces: `components/` (UI), `theme/` (tokens), `store/` (Redux), `services/` (device and IO code), `Navigation/`, `utils/` (pure helpers).

## State rules

- **Data = SQLite through RTK Query.** Reads are `build.query` endpoints and writes are `build.mutation` endpoints in `src/api/<name>.api.ts`, all built on `baseApi` (`src/api/baseApi.ts`) with `queryFn` and `runDb()`. Screens import the generated hooks straight from those files. Cache tags are constants in `src/api/tags.ts`; never write a tag string inline. Mutations list the tags they invalidate. Do not copy DB rows into other Redux slices.
- **UI and settings state = Redux Toolkit.** Filters, selections, flags, settings. One slice per concern in `src/store/slices/`. Use `useAppDispatch` and `useAppSelector` from `@/store/hooks`.
- **Never use `useContext`** in app code (ESLint enforces it). Library providers (Redux, Navigation, SafeArea) are fine.
- **Persistence:** `redux-persist` stores only slices listed in `whitelist` in `src/store/store.ts`, through AsyncStorage (unencrypted). Database data is never persisted this way.
- **Serializable state:** timestamps are epoch milliseconds (numbers) and ids are UUID strings, so Redux and RTK Query caches stay serializable.

## Database and files

- Schema in `src/db/schema/`, migrations generated with `yarn db:generate` into `src/db/migrations/`. `DatabaseProvider` runs pragmas and migrations before the app renders, so no screen can query an unmigrated DB.
- Media files live in the app documents directory; the DB stores paths relative to it. Files are copied before the DB write and removed if the write fails; rows are deleted before files.
- Errors: `runDb()` turns a thrown error into `{ error: { message } }`. Screens show failures with `showToast`.

## Responsive layout

`useWindowClass()` (`src/hooks/useWindowClass.ts`) is the only place breakpoints live: compact below 600, medium 600 to 899, expanded 900 and up, plus `isLandscape`, `bottomChrome`, `gridColumns` and `statColumns`. Branch on it, never on a device model. `Screen` applies safe-area insets and window-class margins.
