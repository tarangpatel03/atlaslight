# Atlaslight

An offline-first travel journal. Record journeys, attach memories (photos, videos, notes, moods) to places, and watch one dark world map fill with amber pins and aurora routes. Everything is stored on the device: no backend, no accounts, no sync. Portfolio project for React Native roles. What it does: [docs/project-spec.md](docs/project-spec.md).

## Stack

| Part     | Choice                                                                             |
| -------- | ---------------------------------------------------------------------------------- |
| App      | React Native 0.88.1 (new architecture, Hermes), React 19.3.0                       |
| Language | TypeScript 5.9.3, strict                                                           |
| Data     | SQLite (op-sqlite) + Drizzle ORM, read and written through RTK Query (`queryFn`)   |
| State    | Redux Toolkit 2 + react-redux 9 + redux-persist 6 (UI and settings state)          |
| Navigate | React Navigation 7 (native stack + bottom tabs)                                    |
| Storage  | AsyncStorage 3 (persisted settings), app documents directory (media files)         |
| Media    | react-native-image-crop-picker, react-native-fs, create-thumbnail, image-resizer   |
| UI       | reanimated 4, gesture-handler, gorhom bottom-sheet, svg, lucide icons              |
| Tests    | Jest (pure logic only)                                                             |
| Tooling  | ESLint 9 (flat config) + Prettier 3, `@/` absolute imports (babel module-resolver) |
| Package  | Yarn classic (1.x), Node >= 22.11                                                  |

## Setup from zero (Windows 11, Android physical phone)

1. Install Node 22 LTS, Yarn classic (`npm i -g yarn`), JDK 17, Android Studio, and Git.
2. In Android Studio's SDK Manager install: Android SDK Platform 37, Build-Tools 37.0.0, NDK 27.1.12297006, Platform-Tools. Set `ANDROID_HOME` to the SDK folder and add `platform-tools` to `PATH`.
3. On the phone: enable Developer options, turn on USB debugging, connect over USB and accept the prompt. Check with `adb devices`.
4. `yarn install`
5. `yarn start` in one terminal (Metro), `yarn android` in another. No environment file is needed.

Dev builds add an **Open UI kit** button to the Settings tab (`src/screens/KitScreen`), a gallery of the UI components; release builds do not include it.

After adding a native module or a font, rebuild with `yarn android`; a Metro reload is not enough. Fonts live in `src/assets/fonts/` and are linked with `npx react-native-asset`. iOS (Mac only): `bundle install`, `cd ios && bundle exec pod install`, then `yarn ios`. The iOS project has not been built.

## Database

Schema is in `src/db/schema/`. After a schema change run `yarn db:generate`, which writes a migration into `src/db/migrations/`; `DatabaseProvider` applies migrations at startup. After the first generate or a migration change, restart Metro with `yarn start --reset-cache`.

## Scripts

| Script              | What it does                 |
| ------------------- | ---------------------------- |
| `yarn start`        | Metro bundler                |
| `yarn android`      | Build and run on Android     |
| `yarn ios`          | Build and run on iOS         |
| `yarn lint`         | ESLint                       |
| `yarn typecheck`    | `tsc --noEmit`               |
| `yarn test`         | Jest (pure-logic tests)      |
| `yarn db:generate`  | Generate a Drizzle migration |
| `yarn format`       | Prettier write               |
| `yarn format:check` | Prettier check               |

## Docs

- [docs/project-spec.md](docs/project-spec.md): what the app does, data model, screens, rules, phases
- [docs/design-brief.md](docs/design-brief.md): visual direction
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): layers, data flow, state rules
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md): naming, imports, tags, git
- [docs/ADDING_A_FEATURE.md](docs/ADDING_A_FEATURE.md): recipe for a new screen with data
- [docs/PROGRESS.md](docs/PROGRESS.md), [docs/PLANNING_TEMPLATE.md](docs/PLANNING_TEMPLATE.md): planning and tracking
- [docs/AI_TOOLING.md](docs/AI_TOOLING.md): Claude Code skills, MCP servers, workflow
