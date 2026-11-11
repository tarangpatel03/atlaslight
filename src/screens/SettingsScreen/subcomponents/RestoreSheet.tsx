import type { ReactNode, Ref } from 'react';
import { ConfirmSheet, type AppBottomSheetRef } from '@/components/surfaces';

interface RestoreSheetProps {
  ref: Ref<AppBottomSheetRef>;
  /** What the restore replaces and with what; empty until a backup passed its checks. */
  message: string;
  /** Keeps the confirm button busy while the restore runs. */
  loading: boolean;
  /** Space kept free under the sheet, e.g. for the floating tab bar. */
  bottomInset?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

// Taller than the default: the text names the backup and what it replaces.
const SHEET_HEIGHT = 360;

/** The question before a restore replaces the journal. Closed until opened by ref. */
export const RestoreSheet = ({
  ref,
  message,
  loading,
  bottomInset,
  onConfirm,
  onCancel,
}: RestoreSheetProps): ReactNode => (
  <ConfirmSheet
    ref={ref}
    title="Restore this backup?"
    message={message}
    confirmLabel="Replace my journal"
    destructive
    loading={loading}
    height={SHEET_HEIGHT}
    bottomInset={bottomInset}
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);
