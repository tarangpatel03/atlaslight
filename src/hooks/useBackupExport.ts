import { useCallback, useRef, useState } from 'react';
import { useLazyGetBackupDataQuery } from '@/api/backup.api';
import { createBackupFile, saveBackupFile } from '@/services/backup.service';
import { APP_VERSION } from '@/utils/appInfo.util';
import { overallProgress, type BackupStageId } from '@/utils/backup.util';
import { showToast } from '@/utils/toast.util';

interface BackupExport {
  working: boolean;
  /** The step the export is in; null when idle. */
  stage: BackupStageId | null;
  /** 0 to 1 over the whole export. */
  progress: number;
  /** Builds the backup and asks where to save it. Ignored while one is already running. */
  start: () => Promise<void>;
}

const messageOf = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'message' in error
    ? String(error.message)
    : undefined;

/** Runs an export from Settings: read the rows, pack the files, save them where the user chooses. */
export const useBackupExport = (): BackupExport => {
  const [loadData] = useLazyGetBackupDataQuery();
  const [state, setState] = useState<{ stage: BackupStageId | null; progress: number }>({
    stage: null,
    progress: 0,
  });
  // A ref, not state: a second press in the same frame must see the first one already running.
  const running = useRef(false);

  const report = useCallback((stage: BackupStageId, fraction: number): void => {
    setState({ stage, progress: overallProgress(stage, fraction) });
  }, []);

  const start = useCallback(async (): Promise<void> => {
    if (running.current) return;
    running.current = true;
    try {
      report('reading', 0);
      const data = await loadData(undefined, false).unwrap();
      const file = await createBackupFile(data, APP_VERSION, report);
      report('saving', 0);
      const outcome = await saveBackupFile(file);
      if (outcome === 'saved') showToast.success('Backup saved.', file.fileName);
    } catch (e) {
      showToast.error("Couldn't back up your journal", messageOf(e));
    } finally {
      running.current = false;
      setState({ stage: null, progress: 0 });
    }
  }, [loadData, report]);

  return { working: state.stage !== null, stage: state.stage, progress: state.progress, start };
};
