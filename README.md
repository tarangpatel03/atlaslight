# BoilerApp (rn_boiler)

A React Native CLI starter for a mobile app that talks to a REST API. It is frontend only and holds infrastructure, not product code: axios client, TanStack Query, Redux Toolkit with persistence, navigation with an auth/app switch, toasts, design tokens and responsive helpers. Every pattern has one small `// EXAMPLE: delete or replace` file.

## Stack

| Part     | Choice                                                                             |
| -------- | ---------------------------------------------------------------------------------- |
| App      | React Native 0.88.1 (new architecture, Hermes), React 19.3.0                       |
| Language | TypeScript 5.9.3, strict                                                           |
| State    | Redux Toolkit 2 + react-redux 9 + redux-persist 6 (client/UI state)                |
| Server   | TanStack Query 5 + axios 1 (server state)                                          |
| Navigate | React Navigation 7 (native stack)                                                  |
| Storage  | react-native-keychain (token), AsyncStorage 3 (persisted non-secret UI state)      |
| UI       | react-native-reanimated 4, safe-area-context, react-native-toast-message           |
| Config   | react-native-config (`.env`)                                                       |
| Tooling  | ESLint 9 (flat config) + Prettier 3, `@/` absolute imports (babel module-resolver) |
| Package  | Yarn classic (1.x), Node >= 22.11                                                  |

## Setup from zero (Windows 11, Android physical phone)

1. Install Node 22 LTS, Yarn classic (`npm i -g yarn`), JDK 17, Android Studio, and Git.
2. In Android Studio's SDK Manager install: Android SDK Platform 37, Build-Tools 37.0.0, NDK 27.1.12297006, Platform-Tools. Set `ANDROID_HOME` to the SDK folder and add `platform-tools` to `PATH`.
3. On the phone: enable Developer options, turn on USB debugging, connect over USB and accept the prompt. Check with `adb devices`.
4. `yarn install`
5. Copy `.env.example` to `.env` and set `API_URL`. Either the PC's LAN IP on the same Wi-Fi (`http://192.168.x.x:3000`), or `http://localhost:3000` plus `adb reverse tcp:3000 tcp:3000` (run it again after the phone reconnects).
6. `yarn start` in one terminal (Metro), `yarn android` in another.

After changing `.env` or adding a native module, rebuild with `yarn android`; a Metro reload is not enough. iOS (Mac only): `bundle install`, `cd ios && bundle exec pod install`, then `yarn ios`. The iOS project was generated from the RN 0.88.1 template and has not been built.

## Rename the app

Replace the placeholders `BoilerApp` (display and project name) and `com.boilerapp` (Android package) everywhere:

1. `package.json`: `name` (lowercase).
2. `app.json`: `name` and `displayName`. `name` must equal `getMainComponentName()` in `MainActivity.kt` and the iOS module name.
3. Android:
   - `android/settings.gradle`: `rootProject.name`.
   - `android/app/build.gradle`: `namespace` and `applicationId`.
   - Move `android/app/src/main/java/com/boilerapp/` to the new package path and change the `package` line in `MainActivity.kt` and `MainApplication.kt`. Change the string returned by `getMainComponentName()`.
   - `android/app/src/main/res/values/strings.xml`: `app_name`.
4. iOS (on a Mac):
   - Rename the folder `ios/BoilerApp/`, the project `ios/BoilerApp.xcodeproj` and the scheme `BoilerApp.xcscheme`.
   - Replace `BoilerApp` in `ios/Podfile` (target), `ios/BoilerApp.xcodeproj/project.pbxproj`, `ios/BoilerApp/Info.plist` and `LaunchScreen.storyboard`.
   - `cd ios && pod install`.
5. Replace the Keychain service id `com.boilerapp.auth-token` in `src/auth/token.store.ts` and the storage name `boilerapp` in `src/store/store.ts`.
6. Search the repo for `BoilerApp`, `boilerapp` and `com.boilerapp`; nothing should remain. Replace the placeholder launcher icon (`android/app/src/main/res/drawable/ic_launcher_*.xml`).
7. Fill in `docs/design-brief.md`, then replace the neutral tokens in `src/theme/`.

## Scripts

| Script              | What it does             |
| ------------------- | ------------------------ |
| `yarn start`        | Metro bundler            |
| `yarn android`      | Build and run on Android |
| `yarn ios`          | Build and run on iOS     |
| `yarn lint`         | ESLint                   |
| `yarn typecheck`    | `tsc --noEmit`           |
| `yarn format`       | Prettier write           |
| `yarn format:check` | Prettier check           |

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): layers, data flow, state rules, auth flow
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md): naming, imports, query keys, response shapes, git
- [docs/ADDING_A_FEATURE.md](docs/ADDING_A_FEATURE.md): recipes for a new screen, and adding roles later
- [docs/PROGRESS.md](docs/PROGRESS.md), [docs/PLANNING_TEMPLATE.md](docs/PLANNING_TEMPLATE.md): planning and tracking
- [docs/AI_TOOLING.md](docs/AI_TOOLING.md): Claude Code skills, MCP servers, workflow
- [docs/design-brief.md](docs/design-brief.md): visual direction (empty template)
