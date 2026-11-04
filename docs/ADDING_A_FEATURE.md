# Adding a feature

`src/api/journeys.api.ts` and `src/api/stops.api.ts` show every step. Copy their patterns.

## New screen with data

1. **Schema (only if new data):** add or change a table in `src/db/schema/`, then run `yarn db:generate` to create the migration. Never edit a generated migration by hand.
2. **Tags:** add the tag name to `TAGS` in `src/api/tags.ts`.
3. **Endpoints:** `src/api/<name>.api.ts` with `baseApi.injectEndpoints`. Each endpoint uses `queryFn` + `runDb()` over Drizzle. Queries `providesTags`; mutations `invalidatesTags`. Export the generated hooks from the same file.
4. **Device or IO code (only if needed):** `src/services/<name>.service.ts` (files, picker, location, backup). Endpoints call it; screens do not.
5. **Pure logic (only if needed):** `src/utils/<name>.util.ts` with a `<name>.util.test.ts` beside it.
6. **UI state (only if needed):** a slice in `src/store/slices/<name>Slice.ts`, added to `rootReducer` in `store.ts`. List it in `whitelist` only if it should survive restarts.
7. **Screen:** `src/screens/<Name>Screen/index.tsx` plus `style.ts`. Wrap in `Screen`, use the RTK Query hooks, handle loading, error and empty states, show failures with `showToast`.
8. **Navigation:** add the name to `SCREENS` in `src/Navigation/routes.ts`, its params to `navigation.types.ts`, and a `Stack.Screen` in `RootNavigator.tsx`.
9. **Check:** `yarn typecheck`, `yarn lint`, `yarn test`, then open it on the device.

Before UI work read `docs/design-brief.md` and use the tokens in `src/theme/`.
