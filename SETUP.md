# Atlaslight — setup for these files

Copy everything here into the root of your React Native project (the Tasklane frontend boilerplate),
merging folders. `src/store/store.ts` is meant to be MERGED into your existing store, not to replace it.

## 1. Install

```bash
yarn add @op-engineering/op-sqlite drizzle-orm uuid react-native-get-random-values
yarn add -D drizzle-kit babel-plugin-inline-import @types/uuid react-native-asset
```

Media (picker, file storage, thumbnails):

```bash
yarn add react-native-image-crop-picker @dr.pogodin/react-native-fs react-native-create-thumbnail @bam.tech/react-native-image-resizer
```

`@bam.tech/react-native-image-resizer` is new to the stack: it makes the small photo thumbnails
used by grids and map pins, so the map never decodes full-size photos.

Android permissions in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_VISUAL_USER_SELECTED" />
<uses-permission android:name="android.permission.ACCESS_MEDIA_LOCATION" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
```

`ACCESS_MEDIA_LOCATION` matters: without it Android strips GPS from photo EXIF, and the
"Found in your photos" suggestion never fires.

Add this as the FIRST line of `index.js` (uuid crashes on React Native without it):

```js
import 'react-native-get-random-values';
```

## 2. Babel — `babel.config.js`

```js
plugins: [
  ['inline-import', { extensions: ['.sql'] }],
  // keep the reanimated / worklets plugin LAST
],
```

## 3. Metro — `metro.config.js`

```js
const defaultConfig = getDefaultConfig(__dirname);
const config = {
  resolver: { sourceExts: [...defaultConfig.resolver.sourceExts, 'sql'] },
};
```

## 4. Database migrations

Add to `package.json` scripts:

```json
"db:generate": "drizzle-kit generate"
```

Run `yarn db:generate` once. It creates `src/db/migrations/migrations.js`, which
`DatabaseProvider` imports. Then `yarn start --reset-cache`.

Run it again after every schema change.

## 5. Fonts

Download from Google Fonts and copy these static files into `src/assets/fonts/`
(rename if the download uses longer names such as `_72pt`):

- `Fraunces-Medium.ttf`, `Fraunces-SemiBold.ttf`
- `Manrope-Regular.ttf`, `Manrope-Medium.ttf`, `Manrope-SemiBold.ttf`, `Manrope-Bold.ttf`
- `SpaceGrotesk-Medium.ttf`, `SpaceGrotesk-SemiBold.ttf`

Then run `npx react-native-asset` and rebuild the Android app.

## 6. App tree

```tsx
<Provider store={store}>
  <DatabaseProvider fallback={<Splash />}>
    <NavigationContainer>{/* ... */}</NavigationContainer>
  </DatabaseProvider>
</Provider>
```

## 7. Check

- Imports use the `@/` alias; change them if your boilerplate uses a different one.
- `src/theme/mapStyle.ts`: open https://tiles.openfreemap.org/styles/dark in a browser and
  confirm its `sources` URL and `glyphs` match the constants at the top of the file.
- Cascade deletes rely on `PRAGMA foreign_keys = ON` in `configureDatabase()`; keep that call.

## What's in here

| Path                          | What                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `src/db/`                     | Drizzle schema (journeys, stops, media, places, wishlist), op-sqlite client         |
| `src/db/DatabaseProvider.tsx` | Runs pragmas + migrations before the app renders                                    |
| `src/api/`                    | RTK Query `baseApi` over the local DB, `tags.ts`, `journeys.api.ts`, `stops.api.ts` |
| `src/store/`                  | Store wiring and settings slice                                                     |
| `src/services/`               | Picker (library + camera), file storage and thumbnails                              |
| `src/utils/exif.util.ts`      | EXIF GPS/date parsing (+ Jest tests)                                                |
| `src/theme/`                  | Atlaslight tokens: colours, type, spacing, shadows, motion, map style               |
| `drizzle.config.ts`           | Migration generation config                                                         |
| `react-native.config.js`      | Font linking                                                                        |

After installing: `yarn typecheck` and `yarn test`.
