import ImageResizer from '@bam.tech/react-native-image-resizer';
import { copyFile, DocumentDirectoryPath, exists, mkdir, moveFile, unlink } from '@dr.pogodin/react-native-fs';
import { createThumbnail } from 'react-native-create-thumbnail';
import { v4 as uuidv4 } from 'uuid';

import type { MediaType } from '@/db/schema';

import type { PickedMedia } from '@/services/picker.service';

/**
 * Media lives in the app's documents directory:
 *   media/<journeyId>/<mediaId>.<ext>
 *   thumbs/<journeyId>/<mediaId>.jpg
 * The DB stores paths RELATIVE to DocumentDirectoryPath, so backups restore on any device
 * (and iOS app-container paths, which change between installs, never end up in the DB).
 */

const THUMB_SIZE = 480; // px, long edge — sharp enough for 3-column grids and 52px pins
const THUMB_QUALITY = 80;

export type StoredMedia = {
  id: string;
  type: MediaType;
  filePath: string;
  thumbnailPath: string | null;
  width: number;
  height: number;
  durationMs: number | null;
  takenAt: number | null;
  latitude: number | null;
  longitude: number | null;
  sourceAssetId: string | null;
};

const stripScheme = (p: string): string => p.replace(/^file:\/\//, '');

/** Relative DB path → absolute file path. */
export const toAbsolute = (relativePath: string): string => `${DocumentDirectoryPath}/${relativePath}`;

/** Relative DB path → URI for <Image source={{ uri }}> / FastImage / react-native-video. */
export const mediaUri = (relativePath: string | null | undefined): string | undefined =>
  relativePath ? `file://${toAbsolute(relativePath)}` : undefined;

const extensionOf = (path: string, type: MediaType): string => {
  const match = /\.([a-z0-9]{2,5})$/i.exec(stripScheme(path));
  if (match) return match[1].toLowerCase();
  return type === 'video' ? 'mp4' : 'jpg';
};

const ensureDir = async (relativeDir: string): Promise<void> => {
  const abs = toAbsolute(relativeDir);
  if (!(await exists(abs))) await mkdir(abs);
};

const makeThumbnail = async (
  item: PickedMedia,
  sourceAbs: string,
  journeyId: string,
  mediaId: string,
): Promise<string> => {
  const thumbRel = `thumbs/${journeyId}/${mediaId}.jpg`;
  const thumbAbs = toAbsolute(thumbRel);

  if (item.type === 'video') {
    const thumb = await createThumbnail({ url: `file://${sourceAbs}`, timeStamp: 1000, format: 'jpeg' });
    const resized = await ImageResizer.createResizedImage(thumb.path, THUMB_SIZE, THUMB_SIZE, 'JPEG', THUMB_QUALITY);
    await moveFile(stripScheme(resized.path ?? resized.uri), thumbAbs);
  } else {
    const resized = await ImageResizer.createResizedImage(
      `file://${sourceAbs}`,
      THUMB_SIZE,
      THUMB_SIZE,
      'JPEG',
      THUMB_QUALITY,
      0,
      undefined,
      false,
      { mode: 'contain', onlyScaleDown: true },
    );
    await moveFile(stripScheme(resized.path ?? resized.uri), thumbAbs);
  }
  return thumbRel;
};

const safeUnlink = async (relativePath: string | null | undefined): Promise<void> => {
  if (!relativePath) return;
  try {
    const abs = toAbsolute(relativePath);
    if (await exists(abs)) await unlink(abs);
  } catch (e) {
    if (__DEV__) console.warn('[media] delete failed', relativePath, e);
  }
};

/** Removes the files of the given media rows (call AFTER the rows are deleted). */
export const deleteMediaFiles = async (items: Pick<StoredMedia, 'filePath' | 'thumbnailPath'>[]): Promise<void> => {
  await Promise.all(items.flatMap(m => [safeUnlink(m.filePath), safeUnlink(m.thumbnailPath)]));
};

/** Removes every file of a journey (call AFTER the journey row is deleted). */
export const deleteJourneyFolder = async (journeyId: string): Promise<void> => {
  await Promise.all([safeUnlink(`media/${journeyId}`), safeUnlink(`thumbs/${journeyId}`)]);
};

/**
 * Copies one picked file into app storage and creates its thumbnail.
 * A failed thumbnail is not fatal (the grid falls back to the full image);
 * a failed copy throws.
 */
export const importMedia = async (item: PickedMedia, journeyId: string): Promise<StoredMedia> => {
  const id = uuidv4();
  const ext = extensionOf(item.path, item.type);
  const fileRel = `media/${journeyId}/${id}.${ext}`;

  await ensureDir(`media/${journeyId}`);
  await ensureDir(`thumbs/${journeyId}`);
  await copyFile(stripScheme(item.path), toAbsolute(fileRel));

  let thumbnailPath: string | null = null;
  try {
    thumbnailPath = await makeThumbnail(item, toAbsolute(fileRel), journeyId, id);
  } catch (e) {
    if (__DEV__) console.warn('[media] thumbnail failed', e);
  }

  return {
    id,
    type: item.type,
    filePath: fileRel,
    thumbnailPath,
    width: item.width,
    height: item.height,
    durationMs: item.durationMs,
    takenAt: item.takenAt,
    latitude: item.latitude,
    longitude: item.longitude,
    sourceAssetId: item.sourceAssetId,
  };
};

/**
 * Imports several files one at a time (keeps memory flat for big videos).
 * If any copy fails, the files already copied are removed and the error is rethrown,
 * so a failed save never leaves orphans on disk.
 */
export const importMediaBatch = async (items: PickedMedia[], journeyId: string): Promise<StoredMedia[]> => {
  const done: StoredMedia[] = [];
  try {
    for (const item of items) {
      done.push(await importMedia(item, journeyId));
    }
    return done;
  } catch (e) {
    await deleteMediaFiles(done);
    throw e;
  }
};
