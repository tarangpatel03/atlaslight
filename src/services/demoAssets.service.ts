import {
  CachesDirectoryPath,
  MainBundlePath,
  copyFile,
  copyFileRes,
  unlink,
} from '@dr.pogodin/react-native-fs';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { DEMO_PHOTOS, type DemoPhotoKey } from '@/assets/demo';
import type { PickedMedia } from '@/services/picker.service';

/**
 * The demo photos are linked into the app by `npx react-native-asset` (Android drawables, iOS bundle
 * resources), because a bundled Metro image in a release build has no file path to copy from.
 */

/** Where a demo memory happened, copied onto its photo like a camera would. */
export type DemoPhotoMeta = { latitude: number; longitude: number; takenAt: number };

/** Copies a linked demo photo to a temp file and describes it like a picked photo, ready for `importMediaBatch`. */
export const materializeDemoPhoto = async (
  key: DemoPhotoKey,
  meta: DemoPhotoMeta,
): Promise<PickedMedia> => {
  const photo = DEMO_PHOTOS[key];
  const tempPath = `${CachesDirectoryPath}/demo-${uuidv4()}.jpg`;
  if (Platform.OS === 'android') {
    await copyFileRes(photo.file, tempPath);
  } else {
    if (!MainBundlePath) throw new Error('The app bundle path is not available');
    await copyFile(`${MainBundlePath}/${photo.file}`, tempPath);
  }
  return {
    path: tempPath,
    type: 'photo',
    mime: 'image/jpeg',
    width: photo.width,
    height: photo.height,
    durationMs: null,
    takenAt: meta.takenAt,
    latitude: meta.latitude,
    longitude: meta.longitude,
    sourceAssetId: null,
  };
};

/** Removes the temp copies once they are imported (or the import failed). Best effort. */
export const removeTempFiles = async (paths: string[]): Promise<void> => {
  await Promise.all(paths.map((path) => unlink(path).catch(() => undefined)));
};
