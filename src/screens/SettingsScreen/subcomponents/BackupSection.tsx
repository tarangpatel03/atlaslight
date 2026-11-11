import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useGetDataCountsQuery } from '@/api/data.api';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { ProgressBar } from '@/components/charts';
import { useBackupExport } from '@/hooks/useBackupExport';
import type { RestoreStatus } from '@/hooks/useBackupRestore';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { BACKUP_STAGES } from '@/utils/backup.util';
import { SettingsSection } from './SettingsSection';

interface BackupSectionProps {
  restoreStatus: RestoreStatus;
  /** 0 to 1 while a picked backup is being checked. */
  restoreProgress: number;
  onRestore: () => void;
}

/** Saves the journal to one .zip the user places, or replaces it from one; shows what is going on while it runs. */
export const BackupSection = ({
  restoreStatus,
  restoreProgress,
  onRestore,
}: BackupSectionProps): ReactNode => {
  const { working, stage, progress, start } = useBackupExport();
  const { data: counts } = useGetDataCountsQuery();
  const isEmpty = counts !== undefined && counts.journeyCount === 0 && counts.stopCount === 0;
  const restoring = restoreStatus !== 'idle';
  const busy = working || restoring;

  let label = '';
  let fraction = 0;
  if (working) {
    label = BACKUP_STAGES.find((item) => item.id === stage)?.label ?? '';
    fraction = progress;
  } else if (restoreStatus === 'checking') {
    label = 'Checking the backup';
    fraction = restoreProgress;
  } else if (restoreStatus === 'restoring') {
    label = 'Restoring your journal';
    fraction = 1;
  }

  return (
    <SettingsSection title="Backup">
      <AppText variant="body" color={colors.inkMuted}>
        One .zip with your journeys, memories, photos and videos. You choose where it is saved.
      </AppText>
      <AppButton
        label="Back up to a file"
        variant="secondary"
        disabled={busy || counts === undefined || isEmpty}
        onPress={() => void start()}
      />
      <AppButton
        label="Restore from a file"
        variant="secondary"
        disabled={busy}
        onPress={onRestore}
      />
      {busy ? (
        <View style={styles.progress}>
          <View style={styles.progressText}>
            <AppText variant="caption" color={colors.inkMuted}>
              {label}
            </AppText>
            <AppText variant="caption" color={colors.inkMuted}>
              {`${Math.round(fraction * 100)}%`}
            </AppText>
          </View>
          <ProgressBar progress={fraction} />
        </View>
      ) : null}
    </SettingsSection>
  );
};

const styles = StyleSheet.create({
  progress: { gap: space[2] },
  progressText: { flexDirection: 'row', justifyContent: 'space-between' },
});
