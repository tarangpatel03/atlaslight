import { errorCodes, isErrorWithCode, saveDocuments } from '@react-native-documents/picker';
import {
  CachesDirectoryPath,
  DocumentDirectoryPath,
  exists,
  getFSInfo,
  mkdir,
  readDir,
  unlink,
  writeFile,
} from '@dr.pogodin/react-native-fs';
import { NO_COMPRESSION, subscribe, zip } from 'react-native-zip-archive';
import { getStorageSizes } from '@/services/storageInfo.service';
import {
  backupFileName,
  buildManifest,
  DATA_FILE,
  MANIFEST_FILE,
  MEDIA_ZIP_FILE,
  requiredFreeSpace,
  THUMBS_ZIP_FILE,
  type BackupData,
  type BackupStageId,
} from '@/utils/backup.util';

/** Called as an export moves along: the stage it is in and how far that stage is, 0 to 1. */
export type BackupProgress = (stage: BackupStageId, fraction: number) => void;

export interface BackupFile {
  /** Absolute path of the finished .zip in the cache folder. */
  path: string;
  fileName: string;
}

export type SaveOutcome = 'saved' | 'cancelled';

const STAGING_DIR = `${CachesDirectoryPath}/backup-export`;

/** Deletes a file or folder; a missing one or a failed delete is not an error here. */
export const removeQuietly = async (path: string): Promise<void> => {
  try {
    if (await exists(path)) await unlink(path);
  } catch {
    // Cache files are cleaned again on the next export.
  }
};

/** Runs a zip call while forwarding the library's progress events (0 to 1) to `onFraction`. */
export const withZipProgress = async (
  onFraction: (fraction: number) => void,
  run: () => Promise<unknown>,
): Promise<void> => {
  const subscription = subscribe(({ progress }) => onFraction(progress));
  try {
    await run();
  } finally {
    subscription.remove();
  }
};

const hasFiles = async (folder: string): Promise<boolean> =>
  (await exists(folder)) && (await readDir(folder)).length > 0;

/** Throws a message for the user when the phone cannot hold the files an export builds. */
const ensureFreeSpace = async (): Promise<void> => {
  const [{ freeSpace }, { mediaBytes }] = await Promise.all([getFSInfo(), getStorageSizes()]);
  if (freeSpace < requiredFreeSpace(mediaBytes)) {
    throw new Error(
      'Not enough free space on this phone to build the backup. Free some up and try again.',
    );
  }
};

/**
 * Builds the backup .zip in the cache folder: manifest and rows as JSON, the media and thumbnail folders
 * as inner zips (see `backup.util` for the layout), all bundled without further compression. The journal
 * itself is only read. The staging folder is removed whether this works or not, and a half-built file is
 * deleted on failure.
 */
export const createBackupFile = async (
  data: BackupData,
  appVersion: string,
  onProgress: BackupProgress,
): Promise<BackupFile> => {
  await ensureFreeSpace();

  const fileName = backupFileName(Date.now());
  const path = `${CachesDirectoryPath}/${fileName}`;
  try {
    await removeQuietly(STAGING_DIR);
    // The zip library adds to a file that already exists, so start from nothing.
    await removeQuietly(path);
    await mkdir(STAGING_DIR);

    onProgress('reading', 0);
    const manifestPath = `${STAGING_DIR}/${MANIFEST_FILE}`;
    const dataPath = `${STAGING_DIR}/${DATA_FILE}`;
    await writeFile(
      manifestPath,
      JSON.stringify(buildManifest(data, Date.now(), appVersion)),
      'utf8',
    );
    await writeFile(dataPath, JSON.stringify(data), 'utf8');
    onProgress('reading', 1);

    const parts = [manifestPath, dataPath];
    const folders = [
      {
        stage: 'media',
        folder: `${DocumentDirectoryPath}/media`,
        target: `${STAGING_DIR}/${MEDIA_ZIP_FILE}`,
      },
      {
        stage: 'thumbs',
        folder: `${DocumentDirectoryPath}/thumbs`,
        target: `${STAGING_DIR}/${THUMBS_ZIP_FILE}`,
      },
    ] as const;
    for (const { stage, folder, target } of folders) {
      onProgress(stage, 0);
      if (await hasFiles(folder)) {
        await withZipProgress(
          (fraction) => onProgress(stage, fraction),
          () => zip([folder], target),
        );
        parts.push(target);
      }
      onProgress(stage, 1);
    }

    onProgress('bundling', 0);
    await withZipProgress(
      (fraction) => onProgress('bundling', fraction),
      () => zip(parts, path, NO_COMPRESSION),
    );
    return { path, fileName };
  } catch {
    await removeQuietly(path);
    throw new Error(
      "Couldn't write the backup file. Check that the phone has free space and try again.",
    );
  } finally {
    await removeQuietly(STAGING_DIR);
  }
};

/**
 * Opens the system "Save as" dialog so the user picks the folder and name, and copies the backup there.
 * Dismissing the dialog is not an error. The cached copy is deleted either way.
 */
export const saveBackupFile = async (file: BackupFile): Promise<SaveOutcome> => {
  try {
    const [result] = await saveDocuments({
      sourceUris: [`file://${file.path}`],
      mimeType: 'application/zip',
      fileName: file.fileName,
    });
    if (result.error) throw new Error(result.error);
    return 'saved';
  } catch (e) {
    if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return 'cancelled';
    throw new Error("Couldn't save the backup file to the place you chose.");
  } finally {
    await removeQuietly(file.path);
  }
};
