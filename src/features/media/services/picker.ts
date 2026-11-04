import ImagePicker, { type ImageOrVideo } from 'react-native-image-crop-picker';

import type { MediaType } from '@/db/schema';

import { extractGps, extractTakenAt } from './exif';

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

function normalize(item: ImageOrVideo): PickedMedia {
  // Read the optional fields loosely: their presence differs by platform and picker version.
  const loose = item as unknown as {
    exif?: Record<string, unknown> | null;
    duration?: number | null;
    creationDate?: string | null;
    localIdentifier?: string | null;
  };
  const isVideo = item.mime.startsWith('video/');
  const exif = loose.exif ?? undefined;
  const gps = extractGps(exif);
  return {
    path: item.path,
    type: isVideo ? 'video' : 'photo',
    mime: item.mime,
    width: item.width,
    height: item.height,
    durationMs: isVideo && loose.duration != null ? Math.round(loose.duration) : null,
    takenAt: extractTakenAt(exif) ?? (loose.creationDate ? Number(loose.creationDate) * 1000 : null),
    latitude: gps?.latitude ?? null,
    longitude: gps?.longitude ?? null,
    sourceAssetId: loose.localIdentifier ?? null,
  };
}

function isCancel(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === 'E_PICKER_CANCELLED';
}

/** Multi-select from the library. Resolves to [] if the user cancels. */
export async function pickFromLibrary(maxFiles = 30): Promise<PickedMedia[]> {
  try {
    const items = await ImagePicker.openPicker({ ...PICKER_OPTIONS, multiple: true, maxFiles });
    return items.map(normalize);
  } catch (e) {
    if (isCancel(e)) return [];
    throw e;
  }
}

/** Opens the system camera. Resolves to null if the user cancels. */
export async function captureWithCamera(mediaType: 'photo' | 'video' = 'photo'): Promise<PickedMedia | null> {
  try {
    const item = await ImagePicker.openCamera({ ...PICKER_OPTIONS, mediaType });
    return normalize(item);
  } catch (e) {
    if (isCancel(e)) return null;
    throw e;
  }
}

/** The first picked item with GPS + time — powers the "Found in your photos" suggestion. */
export function suggestFromMedia(items: PickedMedia[]): { latitude: number; longitude: number; takenAt: number | null } | null {
  const hit = items.find(i => i.latitude !== null && i.longitude !== null);
  return hit ? { latitude: hit.latitude!, longitude: hit.longitude!, takenAt: hit.takenAt } : null;
}

/** Deletes the picker's temp copies once they've been imported. */
export async function cleanPickerCache(): Promise<void> {
  try {
    await ImagePicker.clean();
  } catch {
    // best effort
  }
}
