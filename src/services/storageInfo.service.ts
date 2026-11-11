import { DocumentDirectoryPath, exists, readDir, stat } from '@dr.pogodin/react-native-fs';
import { sqlite } from '@/db/client';

export interface StorageSizes {
  /** The SQLite file plus its write-ahead log, in bytes. */
  databaseBytes: number;
  /** Photos, videos and thumbnails in the documents directory, in bytes. */
  mediaBytes: number;
}

/** Size of one file, or 0 when it does not exist (the -wal file is absent after a checkpoint). */
const fileSize = async (path: string): Promise<number> =>
  (await exists(path)) ? (await stat(path)).size : 0;

/** Total size of every file under a folder; a missing folder counts as 0. */
const folderSize = async (path: string): Promise<number> => {
  if (!(await exists(path))) return 0;
  const items = await readDir(path);
  const sizes = await Promise.all(
    items.map((item) => (item.isDirectory() ? folderSize(item.path) : Promise.resolve(item.size))),
  );
  return sizes.reduce((sum, size) => sum + size, 0);
};

/** How much room the journal takes on this device, for the Data section of Settings. */
export const getStorageSizes = async (): Promise<StorageSizes> => {
  const dbPath = sqlite.getDbPath();
  const [database, wal, media, thumbs] = await Promise.all([
    fileSize(dbPath),
    fileSize(`${dbPath}-wal`),
    folderSize(`${DocumentDirectoryPath}/media`),
    folderSize(`${DocumentDirectoryPath}/thumbs`),
  ]);
  return { databaseBytes: database + wal, mediaBytes: media + thumbs };
};
