import { useCallback, useRef, useState } from 'react';
import { useRestoreBackupMutation } from '@/api/backup.api';
import { useResetJournalState } from '@/hooks/useResetJournalState';
import { discardStaging, pickBackupFile, stageBackup } from '@/services/backupRestore.service';
import { formatRestoreSummary } from '@/utils/backup.util';
import { showToast } from '@/utils/toast.util';

export type RestoreStatus = 'idle' | 'checking' | 'restoring';

interface BackupRestore {
  status: RestoreStatus;
  /** 0 to 1 while a picked backup is being checked. */
  progress: number;
  /** The confirmation text once a backup passed every check; null otherwise. */
  pending: string | null;
  /** Picks a backup file and checks it. The journal is not touched. */
  pick: () => Promise<void>;
  /** Replaces the journal with the checked backup. */
  confirm: () => Promise<void>;
  /** Drops the checked backup. */
  cancel: () => Promise<void>;
}

const messageOf = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'message' in error
    ? String(error.message)
    : undefined;

/**
 * Restoring a backup from Settings, in the order that keeps the journal safe: pick, check (nothing
 * changes), ask, then replace everything in one step. `onRestored` runs after a successful restore.
 */
export const useBackupRestore = (onRestored: () => void): BackupRestore => {
  const [restoreBackup] = useRestoreBackupMutation();
  const resetJournalState = useResetJournalState();
  const [status, setStatus] = useState<RestoreStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  // A ref, not state: a second press in the same frame must see the first one already running.
  const busy = useRef(false);

  const pick = useCallback(async (): Promise<void> => {
    if (busy.current) return;
    busy.current = true;
    try {
      const file = await pickBackupFile();
      if (file === null) return;
      setProgress(0);
      setStatus('checking');
      const staged = await stageBackup(file, setProgress);
      setPending(formatRestoreSummary(staged.summary));
    } catch (e) {
      showToast.error("This backup can't be restored", messageOf(e));
    } finally {
      busy.current = false;
      setStatus('idle');
    }
  }, []);

  const confirm = useCallback(async (): Promise<void> => {
    if (busy.current) return;
    busy.current = true;
    setStatus('restoring');
    try {
      await restoreBackup().unwrap();
      resetJournalState();
      onRestored();
      showToast.success('Your journal is restored.');
    } catch {
      showToast.error("Couldn't restore your journal", 'Your journal was not changed.');
    } finally {
      await discardStaging();
      setPending(null);
      busy.current = false;
      setStatus('idle');
    }
  }, [onRestored, resetJournalState, restoreBackup]);

  const cancel = useCallback(async (): Promise<void> => {
    // The sheet also reports its own closing after a restore; there is nothing to drop by then.
    if (busy.current) return;
    await discardStaging();
    setPending(null);
  }, []);

  return { status, progress, pending, pick, confirm, cancel };
};
