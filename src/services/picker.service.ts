import ImagePicker, { type ImageOrVideo } from 'react-native-image-crop-picker';

import type { MediaType } from '@/db/schema';

import { extractGps, extractTakenAt } from '@/utils/exif.util';

/** A photo or video the user picked, before it's copied into app storage. */
export type PickedMedia = {
  /** Temporary file path from the picker (may be a cache file that the OS can clear). */
  path: string;
  type: MediaType;
  mime: string;
  width: number;
  height: number;
  durationMs: number | null;
  takenAt: number | null;
  latitude: number | null;
  longitude: number | null;
  /** iOS asset id; Android gives none, so duplicates are caught by path only. */
  sourceAssetId: string | null;
};

const PICKER_OPTIONS = {
  mediaType: 'any',
  includeExif: true,
  forceJpg: true,
  compressImageMaxWidth: 2560,
  compressImageMaxHeight: 2560,
  compressImageQuality: 0.85,
} as const;

/** Reads a field the picker types may not declare; its presence differs by platform and version. */
const readField = (item: object, key: string): unknown => (key in item ? Reflect.get(item, key) : undefined);

const normalize = (item: ImageOrVideo): PickedMedia => {
  const rawExif = readField(item, 'exif');
  const exif = typeof rawExif === 'object' && rawExif !== null ? Object.fromEntries(Object.entries(rawExif)) : undefined;
  const duration = readField(item, 'duration');
  const creationDate = readField(item, 'creationDate');
  const localIdentifier = readField(item, 'localIdentifier');
  const isVideo = item.mime.startsWith('video/');
  const gps = extractGps(exif);
  return {
    path: item.path,
    type: isVideo ? 'video' : 'photo',
    mime: item.mime,
    width: item.width,
    height: item.height,
    durationMs: isVideo && typeof duration === 'number' ? Math.round(duration) : null,
    takenAt: extractTakenAt(exif) ?? (typeof creationDate === 'string' ? Number(creationDate) * 1000 : null),
    latitude: gps?.latitude ?? null,
    longitude: gps?.longitude ?? null,
    sourceAssetId: typeof localIdentifier === 'string' ? localIdentifier : null,
  };
};

const isCancel = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && 'code' in e && e.code === 'E_PICKER_CANCELLED';

/** Multi-select from the library. Resolves to [] if the user cancels. */
export const pickFromLibrary = async (maxFiles = 30): Promise<PickedMedia[]> => {
  try {
    const items = await ImagePicker.openPicker({ ...PICKER_OPTIONS, multiple: true, maxFiles });
    return items.map(normalize);
  } catch (e) {
    if (isCancel(e)) return [];
    throw e;
  }
};

/** Opens the system camera. Resolves to null if the user cancels. */
export const captureWithCamera = async (mediaType: 'photo' | 'video' = 'photo'): Promise<PickedMedia | null> => {
  try {
    const item = await ImagePicker.openCamera({ ...PICKER_OPTIONS, mediaType });
    return normalize(item);
  } catch (e) {
    if (isCancel(e)) return null;
    throw e;
  }
};

export type MediaSuggestion = { latitude: number; longitude: number; takenAt: number | null };

/** The first picked item with GPS + time — powers the "Found in your photos" suggestion. */
export const suggestFromMedia = (items: PickedMedia[]): MediaSuggestion | null => {
  for (const item of items) {
    if (item.latitude !== null && item.longitude !== null) {
      return { latitude: item.latitude, longitude: item.longitude, takenAt: item.takenAt };
    }
  }
  return null;
};

/** Deletes the picker's temp copies once they've been imported. */
export const cleanPickerCache = async (): Promise<void> => {
  try {
    await ImagePicker.clean();
  } catch {
    // best effort
  }
};
