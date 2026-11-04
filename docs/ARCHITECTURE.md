# Architecture

## Layers

```
Screen (src/screens/<Name>Screen)      layout, local state, reads Redux and query hooks
  -> Query hook (src/hooks/use*.ts)    TanStack Query: caching, loading and error state
    -> Fetcher (src/api/*.api.ts)      one function per endpoint, typed result
      -> axios client (src/api/client/axiosClient.ts)   Bearer header, envelope unwrap, 401 handling
        -> REST API (separate backend)
```

Shared pieces: `components/` (UI), `theme/` (tokens), `store/` (Redux), `auth/` (token storage), `Navigation/`, `config/`, `utils/`.

With the backend boilerplate the rest of the path is controller, service, database. This repo ends at the HTTP call.

## State rules

- **Server state = TanStack Query.** Anything that comes from the API is fetched through a query hook, cached by a key from `queryKeys.ts`, and invalidated after writes. Do not copy API data into Redux.
- **Client/UI state = Redux Toolkit.** Filters, selections, flags, the auth status. One slice per concern in `src/store/slices/`. Use `useAppDispatch` and `useAppSelector` from `@/store/hooks`.
- **Never use `useContext`** in app code (ESLint enforces it). Library providers (Redux, Query, Navigation, SafeArea) are fine.
- **Persistence:** `redux-persist` stores only slices listed in `whitelist` in `src/store/store.ts`, through AsyncStorage (unencrypted). Never persist `auth` or anything secret.

## Responses and errors

Every API response has one envelope (types in `src/api/types/api.types.ts`): `{ success: true, data, meta? }` or `{ success: false, statusCode, error, message, details?, path, timestamp }`. The client returns `data`, or throws `ApiRequestError` with `statusCode`, `message` and per-field `details`. Network failures and timeouts reject with an axios error; show them as "can't reach the server".

## Auth flow

1. Startup: `restoreSession` (called in `App.tsx`) reads the token from the Keychain. Status becomes `signedIn` or `signedOut`; until then `Splash` shows.
2. Login: the login screen calls the login endpoint (not wired in the boilerplate; the stub signs in with a placeholder) and dispatches `signIn(token)`. The token goes to the Keychain and into memory.
3. Requests: the client adds `Authorization: Bearer <token>` to every call except those marked `public: true`.
4. 401: the client clears the token and calls the handler registered in `store.ts`, which clears the query cache and sets the status to `signedOut`.
5. Logout: `signOut()` clears the token and the query cache. It is client-side only.
6. Navigation: `RootNavigator` renders the app screens when `signedIn` and the login screen otherwise. There is one stack and no role branching.

There is no refresh token and no token expiry: a token stays valid until the user signs out. Risk: a leaked token works until the server's signing secret is rotated, because the server cannot revoke it. See [ADDING_A_FEATURE.md](ADDING_A_FEATURE.md) for adding expiry later.

### Backend contract (when you build the API)

- A global auth guard makes every route private unless it is marked `@Public()` (login and health are public).
- The current user comes from a `@CurrentUser()` decorator, never from the request body.
- Login returns an access token and the user; `GET /auth/me` returns the current user.

## Responsive layout

`useWindowClass()` (`src/hooks/useWindowClass.ts`) is the only place breakpoints live: compact below 600, medium 600 to 899, expanded 900 and up, plus `isLandscape`. Branch on it, never on a device model. `Screen` applies safe-area insets and window-class margins.
