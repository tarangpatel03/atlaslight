import type { ReactNode, Ref } from 'react';
import { useDeleteAllDataMutation, useGetDataCountsQuery } from '@/api/data.api';
import { ConfirmSheet, type AppBottomSheetRef } from '@/components/surfaces';
import { useResetJournalState } from '@/hooks/useResetJournalState';
import { formatDeleteAllSummary } from '@/utils/journey.util';
import { showToast } from '@/utils/toast.util';

interface DeleteAllSheetProps {
  ref: Ref<AppBottomSheetRef>;
  /** Space kept free under the sheet, e.g. for the floating tab bar. */
  bottomInset?: number;
  /** Called once everything is gone, e.g. to read the storage sizes again. */
  onDeleted: () => void;
  /** Closes the sheet. */
  onClose: () => void;
}

const messageOf = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'message' in error
    ? String(error.message)
    : undefined;

/** The confirmation for Delete all: says what goes, then wipes the journal. Settings stay. */
export const DeleteAllSheet = ({
  ref,
  bottomInset,
  onDeleted,
  onClose,
}: DeleteAllSheetProps): ReactNode => {
  const resetJournalState = useResetJournalState();
  const { data: counts } = useGetDataCountsQuery();
  const [deleteAllData, { isLoading }] = useDeleteAllDataMutation();

  const confirm = async (): Promise<void> => {
    try {
      await deleteAllData().unwrap();
      resetJournalState();
      onClose();
      onDeleted();
      showToast.success('Your journal is empty.');
    } catch (e) {
      showToast.error("Couldn't delete everything", messageOf(e));
    }
  };

  return (
    <ConfirmSheet
      ref={ref}
      title="Delete all your data?"
      message={counts ? formatDeleteAllSummary(counts) : ''}
      confirmLabel="Delete all data"
      destructive
      loading={isLoading}
      bottomInset={bottomInset}
      onConfirm={() => void confirm()}
      onCancel={onClose}
    />
  );
};
