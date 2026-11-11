import type { ReactNode } from 'react';
import { useGetDataCountsQuery } from '@/api/data.api';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { colors } from '@/theme/colors';
import { SettingsSection } from './SettingsSection';

interface DeleteAllSectionProps {
  /** Opens the confirmation sheet (kept by the screen, so it can cover the whole screen). */
  onAsk: () => void;
}

/** The last Settings section: what Delete all removes, and the button that asks first. */
export const DeleteAllSection = ({ onAsk }: DeleteAllSectionProps): ReactNode => {
  const { data: counts } = useGetDataCountsQuery();
  const isEmpty = counts !== undefined && counts.journeyCount === 0 && counts.stopCount === 0;

  return (
    <SettingsSection title="Delete all">
      <AppText variant="body" color={colors.inkMuted}>
        Removes every journey, memory, photo and video from this phone.
      </AppText>
      <AppButton
        label="Delete all data"
        variant="danger"
        disabled={counts === undefined || isEmpty}
        onPress={onAsk}
      />
    </SettingsSection>
  );
};
