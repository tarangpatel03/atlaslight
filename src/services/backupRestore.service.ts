import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import {
  CachesDirectoryPath,
  DocumentDirectoryPath,
  exists,
  getFSInfo,
  mkdir,
  moveFile,
  readFile,
  writeFile,
} from '@dr.pogodin/react-native-fs';
import { getUncompressedSize, listContents, unzip } from 'react-native-zip-archive';
import { removeQuietly, withZipProgress } from '@/services/backup.service';
import {
  buildBackupEntries,
  DATA_FILE,
  describeBackup,
  MANIFEST_FILE,
  MEDIA_ZIP_FILE,
  parseBackupData,
  requiredFreeSpace,
  THUMBS_ZIP_FILE,
  validateBackup,
  type BackupData,
  type BackupSummary,
} from '@/utils/backup.util';

/** The folder a backup is unpacked into before anything in the journal is touched. */
const RESTORE_DIR = `${DocumentDirectoryPath}/restore-staging`;
/** The rows the check accepted (a thumbnail missing from the zip is already set to null). */
const VALIDATED_DATA_FILE = `${RESTORE_DIR}/data.validated.json`;

/** The live media folders, where the restored copy waits, and where the old one is kept until the restore is final. */
const MEDIA_FOLDERS = [
  {
    live: `${DocumentDirectoryPath}/media`,
    old: `${DocumentDirectoryPath}/media.old`,
    staged: `${RESTORE_DIR}/media`,
  },
  {
    live: `${DocumentDirectoryPath}/thumbs`,
    old: `${DocumentDirectoryPath}/thumbs.old`,
    staged: `${RESTORE_DIR}/thumbs`,
  },
] as const;

export interface PickedBackup {
  uri: string;
  fileName: string;
}

export interface StagedBackup {
  summary: BackupSummary;
}

export interface MediaSwap {
  /** Puts the old media back and the restored media aside again, for a restore that fails after the swap. */
  undo: () => Promise<void>;
  /** Deletes the old media and the restore folder: the restore is final. */
  commit: () => Promise<void>;
}

/** Opens the system file picker for a .zip. Returns null when the user closes it without choosing. */
export const pickBackupFile = async (): Promise<PickedBackup | null> => {
  try {
    const [file] = await pick({ type: [types.zip], mode: 'import', allowMultiSelection: false });
    return { uri: file.uri, fileName: file.name ?? 'backup.zip' };
  } catch (e) {
    if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return null;
    throw new Error("Couldn't open the file picker.");
  }
};

/** Turns a failing library call into an error with a message the user can read. */
const orFail = async <T>(call: Promise<T>, message: string): Promise<T> => {
  try {
    return await call;
  } catch {
    throw new Error(message);
  }
};

const readJson = async (path: string): Promise<unknown> =>
  orFail(
    readFile(path, 'utf8').then((text): unknown => JSON.parse(text)),
    'The backup is damaged: a file inside it cannot be read.',
  );

/** `file:///data/.../x%20y.zip` to a plain path. */
const pathOfUri = (uri: string): string => decodeURIComponent(uri.replace(/^file:\/\//, ''));

/** The folder `keepLocalCopy` made for a copy; the file itself when it sits directly in the cache folder. */
const copyFolderOf = (copyPath: string): string => {
  const folder = copyPath.slice(0, copyPath.lastIndexOf('/'));
  return folder.startsWith(`${CachesDirectoryPath}/`) ? folder : copyPath;
};

/** The names inside a zip; an unreadable file means it is not a zip. */
const listNames = async (zipPath: string): Promise<string[]> =>
  (await orFail(listContents(zipPath), 'This file is not a zip archive.')).map(
    (entry) => entry.path,
  );

/** Deletes the restore folder, for a restore the user turned down or one that failed. */
export const discardStaging = async (): Promise<void> => removeQuietly(RESTORE_DIR);

/**
 * Prepares a picked backup for restoring without touching the journal: copies it to the cache, checks
 * the free space, unpacks the rows and the two media zips, runs `validateBackup`, and only then unpacks
 * the media into the restore folder. Throws a message for the user on any problem and leaves nothing
 * behind. `onProgress` gets 0 to 1 across the whole check.
 */
export const stageBackup = async (
  file: PickedBackup,
  onProgress: (fraction: number) => void,
): Promise<StagedBackup> => {
  await discardStaging();
  // Only there if the app was killed in the middle of an earlier restore.
  await Promise.all(MEDIA_FOLDERS.map((folder) => removeQuietly(folder.old)));

  let copyPath: string | null = null;
  try {
    onProgress(0);
    const [copy] = await keepLocalCopy({
      files: [{ uri: file.uri, fileName: file.fileName }],
      destination: 'cachesDirectory',
    });
    if (copy.status !== 'success') throw new Error("Couldn't read the file you picked.");
    const source = pathOfUri(copy.localUri);
    copyPath = source;

    const [{ freeSpace }, size] = await Promise.all([
      getFSInfo(),
      orFail(getUncompressedSize(source), 'This file is not a zip archive.'),
    ]);
    // The inner zips and the unpacked media each take about the size of the media.
    if (freeSpace < requiredFreeSpace(size)) {
      throw new Error('Not enough free space on this phone to restore this backup.');
    }

    const outerNames = await listNames(source);
    const present = (name: string): boolean => outerNames.includes(name);
    if (!present(MANIFEST_FILE) || !present(DATA_FILE)) {
      throw new Error('This file is not an Atlaslight backup.');
    }

    const outerDir = `${RESTORE_DIR}/outer`;
    await mkdir(outerDir);
    const wanted = [MANIFEST_FILE, DATA_FILE, MEDIA_ZIP_FILE, THUMBS_ZIP_FILE].filter(present);
    await withZipProgress(
      (fraction) => onProgress(fraction * 0.4),
      () => orFail(unzip(source, outerDir, { entries: wanted }), 'This file is not a zip archive.'),
    );

    const manifest = await readJson(`${outerDir}/${MANIFEST_FILE}`);
    const data = await readJson(`${outerDir}/${DATA_FILE}`);

    const inner = [
      { name: MEDIA_ZIP_FILE, folder: MEDIA_FOLDERS[0] },
      { name: THUMBS_ZIP_FILE, folder: MEDIA_FOLDERS[1] },
    ]
      .filter((item) => present(item.name))
      .map((item) => ({
        zipPath: `${outerDir}/${item.name}`,
        into: item.folder.staged,
        name: item.name,
      }));
    const namesOf = async (name: string): Promise<string[]> => {
      const item = inner.find((candidate) => candidate.name === name);
      return item ? listNames(item.zipPath) : [];
    };

    const result = validateBackup({
      manifest,
      data,
      entries: buildBackupEntries({
        outer: outerNames,
        media: await namesOf(MEDIA_ZIP_FILE),
        thumbs: await namesOf(THUMBS_ZIP_FILE),
      }),
    });
    if (!result.ok) throw new Error(result.reason);
    onProgress(0.45);

    // Unpacking the media is only worth doing once the backup has passed every check.
    const share = 0.55 / Math.max(1, inner.length);
    for (const [index, item] of inner.entries()) {
      const start = 0.45 + index * share;
      await withZipProgress(
        (fraction) => onProgress(start + fraction * share),
        () =>
          orFail(
            unzip(item.zipPath, item.into),
            'The photos and videos in the backup could not be unpacked.',
          ),
      );
    }
    await writeFile(VALIDATED_DATA_FILE, JSON.stringify(result.data), 'utf8');
    onProgress(1);
    return { summary: describeBackup(result.data, result.manifest) };
  } catch (e) {
    await discardStaging();
    throw e;
  } finally {
    // The unpacked outer files and the copy of the picked file are no longer needed.
    await removeQuietly(`${RESTORE_DIR}/outer`);
    // keepLocalCopy puts the copy in a folder of its own inside the cache; remove that folder, not just the file.
    if (copyPath !== null) await removeQuietly(copyFolderOf(copyPath));
  }
};

/** The rows `stageBackup` accepted, read back from the restore folder. */
export const readStagedData = async (): Promise<BackupData> => {
  const data = parseBackupData(await readJson(VALIDATED_DATA_FILE));
  if (data === null) throw new Error('The prepared backup is missing. Pick the file again.');
  return data;
};

/**
 * Replaces the live media and thumbnail folders with the restored ones by renaming (same volume, so
 * nothing is copied): the old folder is kept as `*.old` until `commit`. If a step fails here, the
 * steps already done are undone before the error is thrown.
 */
export const swapMediaIn = async (): Promise<MediaSwap> => {
  const steps = MEDIA_FOLDERS.map((folder) => ({ ...folder, oldAside: false, newInPlace: false }));

  const undo = async (): Promise<void> => {
    for (const step of [...steps].reverse()) {
      if (step.newInPlace) await moveFile(step.live, step.staged);
      if (step.oldAside) await moveFile(step.old, step.live);
    }
  };

  try {
    for (const step of steps) {
      if (await exists(step.live)) {
        await moveFile(step.live, step.old);
        step.oldAside = true;
      }
      if (await exists(step.staged)) {
        await moveFile(step.staged, step.live);
        step.newInPlace = true;
      }
    }
  } catch (e) {
    await undo();
    throw e;
  }

  return {
    undo,
    commit: async () => {
      await Promise.all(MEDIA_FOLDERS.map((folder) => removeQuietly(folder.old)));
      await discardStaging();
    },
  };
};
