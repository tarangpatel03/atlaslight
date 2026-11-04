# Adding a feature

The `// EXAMPLE: delete or replace` files show every step: `src/api/example.*`, `src/hooks/useExamples.ts`, `src/store/slices/exampleSlice.ts`, `src/screens/HomeScreen/`. Copy them, then delete the examples.

## New screen with data

1. **Endpoint:** add the path to `ENDPOINTS` in `src/api/routes.ts`.
2. **Types:** `src/api/types/<name>.types.ts` for the response and filter types.
3. **Fetcher:** `src/api/<name>.api.ts`, one function per endpoint, using `apiRequest` (or `apiEnvelope` when you need `meta`). Mark a route that needs no token with `public: true`.
4. **Query keys:** `export const <name>Keys = createQueryKeys<Filters>('<name>')` in `src/api/queryKeys.ts`.
5. **Hook:** `src/hooks/use<Name>.ts` with `useQuery` (or `useMutation`; invalidate `<name>Keys.all` or `.lists()` in `onSuccess`).
6. **UI state (only if needed):** a slice in `src/store/slices/<name>Slice.ts`, added to `rootReducer` in `store.ts`. List it in `whitelist` only if it is safe to persist.
7. **Screen:** `src/screens/<Name>Screen/index.tsx` plus `style.ts` for its styles. Wrap in `Screen`, handle loading, error and empty states, show failures with `showToast`.
8. **Navigation:** add the name to `SCREENS` in `src/Navigation/routes.ts`, its params to `navigation.types.ts`, and a `Stack.Screen` in `RootNavigator.tsx`. Screens only for signed-in users go in the `signedIn` branch.
9. **Check:** `yarn typecheck`, `yarn lint`, then open it on the device.

Before UI work read `docs/design-brief.md` and use the tokens in `src/theme/`.

## Matching API module (backend)

For each new screen the API needs a feature module that owns its controller, service, DTOs and entity, and routes protected by the global auth guard (mark open routes `@Public()`). Add the route constants first, then the entity and migration, then DTOs, service, controller. In the backend boilerplate see `docs/ADDING_A_FEATURE.md` there.

## Adding roles later (guide only)

The boilerplate has no roles. To add them:

1. **Backend:** add a `Role` enum (shared package if you have one) and a `role` column on `users` through a migration. Put the role in the login response and in `GET /auth/me`.
2. **Guard and decorator:** add a `@Roles(...)` decorator that stores metadata and a `RolesGuard` registered after the auth guard. The service must still check record ownership; a role check is not enough for user-owned data.
3. **Mobile:** keep the role in the auth slice (set it from the login or `me` response). In `RootNavigator.tsx` branch the signed-in screens by role (one `Stack.Screen` set per role). Hide UI a role cannot use, but treat the server as the only authority.
4. Update `docs/ARCHITECTURE.md`.

## Adding token expiry or refresh later (guide only)

Today the token has no expiry. To add it: set an `exp` (short access token) on the server, add a refresh token stored hashed with rotation and a `/auth/refresh` route, then in `axiosClient.ts` refresh once on a 401 (one request at a time, because tokens rotate) and retry. Keep the refresh token in the Keychain next to the access token.
