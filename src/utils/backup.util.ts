import { z } from 'zod';
import { MEDIA_TYPES, PLACE_SOURCES } from '@/db/enums';
import { MOODS } from '@/db/moods';
import type { Journey, Media, Place, Stop, WishlistItem } from '@/db/schema';
import { formatCount, formatDate, formatList } from '@/utils/format.util';

/**
 * Backup file format, version 1: a .zip holding
 *   manifest.json   what this is, who made it and how many rows to expect
 *   data.json       every row of the five tables, as stored
 *   media.zip       the contents of the app's media/ folder (entries <journeyId>/<mediaId>.<ext>)
 *   thumbs.zip      the contents of the app's thumbs/ folder (entries <journeyId>/<mediaId>.jpg)
 * media.zip and thumbs.zip are left out when that folder is empty. They are separate zips because
 * the zip library names a folder's contents relative to the folder, so one flat zip with the
 * media/ and thumbs/ prefixes would need a copy of every file first.
 * `validateBackup` works on logical entry names: `media/<entry of media.zip>` and
 * `thumbs/<entry of thumbs.zip>`, the same relative paths the rows hold.
 * Settings are not part of it (they live in Redux, not the database).
 */
export const BACKUP_FORMAT = 'atlaslight-backup';
export const BACKUP_VERSION = 1;
export const MANIFEST_FILE = 'manifest.json';
export const DATA_FILE = 'data.json';
export const MEDIA_ZIP_FILE = 'media.zip';
export const THUMBS_ZIP_FILE = 'thumbs.zip';

/** The steps of an export in order, with the share of the progress bar each takes. */
export const BACKUP_STAGES = [
  { id: 'reading', label: 'Reading your journal', weight: 0.05 },
  { id: 'media', label: 'Packing photos and videos', weight: 0.6 },
  { id: 'thumbs', label: 'Packing thumbnails', weight: 0.1 },
  { id: 'bundling', label: 'Finishing the file', weight: 0.2 },
  { id: 'saving', label: 'Saving', weight: 0.05 },
] as const;

export type BackupStageId = (typeof BACKUP_STAGES)[number]['id'];

/** One 0 to 1 value for the whole export, from the stage it is in and how far that stage is (0 to 1). */
export const overallProgress = (stage: BackupStageId, fraction: number): number => {
  const within = Math.min(1, Math.max(0, fraction));
  let finished = 0;
  for (const item of BACKUP_STAGES) {
    if (item.id === stage) return Math.min(1, finished + item.weight * within);
    finished += item.weight;
  }
  return 0;
};

const FREE_SPACE_MARGIN = 20 * 1024 * 1024;

/** Free space an export needs: the inner zips and the final file, each about the size of the media, plus a margin. */
export const requiredFreeSpace = (mediaBytes: number): number => mediaBytes * 2 + FREE_SPACE_MARGIN;

export type BackupCounts = {
  journeys: number;
  stops: number;
  media: number;
  places: number;
  wishlist: number;
};

export type BackupManifest = {
  format: typeof BACKUP_FORMAT;
  version: number;
  /** Epoch milliseconds. */
  exportedAt: number;
  appVersion: string;
  counts: BackupCounts;
};

/** Every row of the journal, typed as the database stores it. */
export type BackupData = {
  journeys: Journey[];
  stops: Stop[];
  media: Media[];
  places: Place[];
  wishlist: WishlistItem[];
};

const text = z.string();
const nullableText = z.string().nullable();
const count = z.number().int().nonnegative();
const timestamp = z.number().int();
const nullableInt = z.number().int().nullable();
const nullableNumber = z.number().nullable();
const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);

// Each row schema is checked against the Drizzle row type, so a column added to the database
// without being added here fails the typecheck instead of silently dropping out of backups.
const journeyRow = z.object({
  id: text,
  title: text,
  description: nullableText,
  coverMediaId: nullableText,
  color: text,
  startDate: timestamp,
  endDate: nullableInt,
  isFavorite: z.boolean(),
  createdAt: timestamp,
  updatedAt: timestamp,
}) satisfies z.ZodType<Journey>;

const stopRow = z.object({
  id: text,
  journeyId: text,
  placeId: nullableText,
  latitude,
  longitude,
  altitude: nullableNumber,
  title: text,
  note: nullableText,
  mood: z.enum(MOODS).nullable(),
  visitedAt: timestamp,
  orderIndex: z.number().int(),
  createdAt: timestamp,
  updatedAt: timestamp,
}) satisfies z.ZodType<Stop>;

const mediaRow = z.object({
  id: text,
  stopId: text,
  type: z.enum(MEDIA_TYPES),
  filePath: text,
  thumbnailPath: nullableText,
  width: nullableInt,
  height: nullableInt,
  durationMs: nullableInt,
  takenAt: nullableInt,
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  sourceAssetId: nullableText,
  sortOrder: z.number().int(),
  createdAt: timestamp,
}) satisfies z.ZodType<Media>;

const placeRow = z.object({
  id: text,
  name: text,
  locality: nullableText,
  adminArea: nullableText,
  countryCode: nullableText,
  countryName: nullableText,
  latitude,
  longitude,
  source: z.enum(PLACE_SOURCES),
  createdAt: timestamp,
}) satisfies z.ZodType<Place>;

const wishlistRow = z.object({
  id: text,
  placeId: text,
  note: nullableText,
  createdAt: timestamp,
}) satisfies z.ZodType<WishlistItem>;

const dataSchema = z.object({
  journeys: z.array(journeyRow),
  stops: z.array(stopRow),
  media: z.array(mediaRow),
  places: z.array(placeRow),
  wishlist: z.array(wishlistRow),
});

const manifestSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.number().int().positive(),
  exportedAt: timestamp,
  appVersion: text,
  counts: z.object({
    journeys: count,
    stops: count,
    media: count,
    places: count,
    wishlist: count,
  }),
});

// Read before the rest of the manifest, so a newer backup whose other fields changed still gets the "newer" message.
const manifestHeadSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.number().int().positive(),
});

const TABLES = ['journeys', 'stops', 'media', 'places', 'wishlist'] as const;

export type BackupResult =
  { ok: true; manifest: BackupManifest; data: BackupData } | { ok: false; reason: string };

const fail = (reason: string): { ok: false; reason: string } => ({ ok: false, reason });

/** Row counts of every table. */
export const countRows = (data: BackupData): BackupCounts => ({
  journeys: data.journeys.length,
  stops: data.stops.length,
  media: data.media.length,
  places: data.places.length,
  wishlist: data.wishlist.length,
});

/** The manifest for a backup of `data` made at `now` (epoch ms) by app version `appVersion`. */
export const buildManifest = (
  data: BackupData,
  now: number,
  appVersion: string,
): BackupManifest => ({
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  exportedAt: now,
  appVersion,
  counts: countRows(data),
});

/** `atlaslight-backup-2026-11-11.zip`, from the device's local date. */
export const backupFileName = (now: number): string => {
  const date = new Date(now);
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${BACKUP_FORMAT}-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.zip`;
};

/** Every media file and thumbnail the rows point to, once each: what goes into the zip next to the JSON. */
export const backupMediaPaths = (data: BackupData): string[] => {
  const paths = new Set<string>();
  for (const item of data.media) {
    paths.add(item.filePath);
    if (item.thumbnailPath) paths.add(item.thumbnailPath);
  }
  return [...paths];
};

/**
 * A path that stays inside the documents folder: relative, forward slashes, no `.` or `..` or empty
 * parts. A crafted backup could otherwise write outside it (zip-slip).
 */
const isSafePath = (path: string): boolean =>
  path.length > 0 &&
  !path.includes('\\') &&
  !path.includes('\0') &&
  !path.startsWith('/') &&
  path.split('/').every((part) => part !== '' && part !== '.' && part !== '..');

const hasPrefix = (path: string, folder: string): boolean =>
  isSafePath(path) && path.startsWith(`${folder}/`);

/** The first repeated value, or null. */
const firstDuplicate = (values: string[]): string | null => {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }
  return null;
};

const dataProblem = (error: z.ZodError): string => {
  const [table, row] = error.issues[0]?.path ?? [];
  const where = typeof row === 'number' ? ` (${String(table)}, row ${row + 1})` : '';
  return `The backup data is damaged${where}.`;
};

/** Checks that rows only point at rows that exist, so a restore cannot fail halfway on a foreign key. */
const referenceProblem = (data: BackupData): string | null => {
  const journeyIds = new Set(data.journeys.map((row) => row.id));
  const stopIds = new Set(data.stops.map((row) => row.id));
  const mediaIds = new Set(data.media.map((row) => row.id));
  const placeIds = new Set(data.places.map((row) => row.id));

  if (data.journeys.some((row) => row.coverMediaId !== null && !mediaIds.has(row.coverMediaId))) {
    return 'A journey uses a cover photo that is not in the backup.';
  }
  if (data.stops.some((row) => !journeyIds.has(row.journeyId))) {
    return 'A memory belongs to a journey that is not in the backup.';
  }
  if (data.stops.some((row) => row.placeId !== null && !placeIds.has(row.placeId))) {
    return 'A memory uses a place that is not in the backup.';
  }
  if (data.media.some((row) => !stopIds.has(row.stopId))) {
    return 'A photo or video belongs to a memory that is not in the backup.';
  }
  if (data.wishlist.some((row) => !placeIds.has(row.placeId))) {
    return 'A wishlist entry uses a place that is not in the backup.';
  }
  if (firstDuplicate(data.wishlist.map((row) => row.placeId)) !== null) {
    return 'The wishlist lists the same place twice.';
  }
  return null;
};

/**
 * Decides whether a backup can be restored. `manifest` and `data` are the parsed JSON files (unknown
 * until checked) and `entries` the zip's file names. Nothing is touched here: the caller deletes
 * the journal only after this says ok, so a bad file leaves the data as it was. The first problem
 * found is returned as a short reason for the user. A thumbnail missing from the zip is allowed
 * (the row falls back to the full image); a missing media file or an unsafe path is not.
 */
export const validateBackup = ({
  manifest,
  data,
  entries,
}: {
  manifest: unknown;
  data: unknown;
  entries: string[];
}): BackupResult => {
  const head = manifestHeadSchema.safeParse(manifest);
  if (!head.success) return fail('This file is not an Atlaslight backup.');
  if (head.data.version > BACKUP_VERSION) {
    return fail('This backup is from a newer version of Atlaslight.');
  }
  if (head.data.version < BACKUP_VERSION)
    return fail('This backup is from an unsupported older version.');

  const parsedManifest = manifestSchema.safeParse(manifest);
  if (!parsedManifest.success) return fail('The backup is damaged: its details are incomplete.');

  const parsedData = dataSchema.safeParse(data);
  if (!parsedData.success) return fail(dataProblem(parsedData.error));
  const rows = parsedData.data;

  // Folders appear as names ending in "/"; every other name must stay inside the documents folder.
  const unsafeEntry = entries.find(
    (name) => !isSafePath(name.endsWith('/') ? name.slice(0, -1) : name),
  );
  if (unsafeEntry !== undefined) return fail('The backup contains a file with an unsafe name.');

  const found = countRows(rows);
  for (const table of TABLES) {
    if (found[table] !== parsedManifest.data.counts[table]) {
      return fail(
        `The backup is incomplete: expected ${parsedManifest.data.counts[table]} ${table} but found ${found[table]}.`,
      );
    }
    if (firstDuplicate(rows[table].map((row) => row.id)) !== null) {
      return fail(`The backup repeats an id in ${table}.`);
    }
  }
  const assetIds = rows.media.flatMap((row) =>
    row.sourceAssetId === null ? [] : [row.sourceAssetId],
  );
  if (firstDuplicate(assetIds) !== null) return fail('The backup lists the same photo twice.');

  const reference = referenceProblem(rows);
  if (reference !== null) return fail(reference);

  const available = new Set(entries);
  const media: Media[] = [];
  for (const item of rows.media) {
    if (!hasPrefix(item.filePath, 'media'))
      return fail('The backup refers to a file outside its media folder.');
    if (item.thumbnailPath !== null && !hasPrefix(item.thumbnailPath, 'thumbs')) {
      return fail('The backup refers to a thumbnail outside its thumbnail folder.');
    }
    if (!available.has(item.filePath))
      return fail('A photo or video is missing from the backup file.');
    const thumbnailMissing = item.thumbnailPath !== null && !available.has(item.thumbnailPath);
    media.push(thumbnailMissing ? { ...item, thumbnailPath: null } : item);
  }

  return { ok: true, manifest: parsedManifest.data, data: { ...rows, media } };
};

/**
 * The entry names `validateBackup` checks for a nested backup: the outer zip's own names, plus the
 * names inside media.zip and thumbs.zip under the `media/` and `thumbs/` prefixes the rows use.
 */
export const buildBackupEntries = ({
  outer,
  media,
  thumbs,
}: {
  outer: string[];
  media: string[];
  thumbs: string[];
}): string[] => [
  ...outer,
  ...media.map((name) => `media/${name}`),
  ...thumbs.map((name) => `thumbs/${name}`),
];

/** What a backup holds, for the confirmation before it replaces the journal. */
export type BackupSummary = {
  journeyCount: number;
  stopCount: number;
  photoCount: number;
  videoCount: number;
  /** Epoch milliseconds the backup was made. */
  exportedAt: number;
};

/** Counts of a backup's journeys, memories, photos and videos, and when it was made. */
export const describeBackup = (data: BackupData, manifest: BackupManifest): BackupSummary => ({
  journeyCount: data.journeys.length,
  stopCount: data.stops.length,
  photoCount: data.media.filter((item) => item.type === 'photo').length,
  videoCount: data.media.filter((item) => item.type === 'video').length,
  exportedAt: manifest.exportedAt,
});

/** `Replaces everything on this phone with the backup from 11 Nov 2026: 7 journeys, 31 memories and 32 photos. ...` */
export const formatRestoreSummary = (summary: BackupSummary): string => {
  const parts = [
    formatCount(summary.journeyCount, 'journey', 'journeys'),
    formatCount(summary.stopCount, 'memory', 'memories'),
    formatCount(summary.photoCount, 'photo', 'photos'),
  ];
  if (summary.videoCount > 0) parts.push(formatCount(summary.videoCount, 'video', 'videos'));
  return `Replaces everything on this phone with the backup from ${formatDate(summary.exportedAt)}: ${formatList(parts)}. Your current journal is deleted. Your settings stay. This cannot be undone.`;
};

/** The rows of a backup's data file when they have the right shape, otherwise null. No other checks (see `validateBackup`). */
export const parseBackupData = (data: unknown): BackupData | null => {
  const parsed = dataSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
};
