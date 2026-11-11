import { useState, type ReactNode } from 'react';
import { useGetJourneysQuery } from '@/api/journeys.api';
import { AppText } from '@/components/brand';
import { TextField } from '@/components/inputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDisplayName, setDisplayName } from '@/store/slices';
import { colors } from '@/theme/colors';
import { formatCount, formatMonthYear } from '@/utils/format.util';
import { SettingsSection } from './SettingsSection';

/** Display name (kept on this phone) and since when, and how many journeys, the journal holds. */
export const ProfileSection = (): ReactNode => {
  const dispatch = useAppDispatch();
  const saved = useAppSelector(selectDisplayName);
  const [draft, setDraft] = useState(saved);
  const { data: journeys } = useGetJourneysQuery();

  // The list is ordered for display, so take the earliest start date explicitly.
  const first = journeys?.length ? Math.min(...journeys.map((journey) => journey.startDate)) : null;

  const save = (): void => {
    dispatch(setDisplayName(draft));
    // Show what was actually stored (trimmed and capped by the slice).
    setDraft(draft.trim());
  };

  return (
    <SettingsSection title="Profile">
      <TextField
        label="Your name"
        value={draft}
        onChangeText={setDraft}
        onBlur={save}
        maxLength={40}
        autoCapitalize="words"
        hint="Only shown on this phone"
      />
      {first !== null && journeys ? (
        <AppText variant="caption" color={colors.inkMuted}>
          {`Since ${formatMonthYear(first)} · ${formatCount(journeys.length, 'journey', 'journeys')}`}
        </AppText>
      ) : null}
    </SettingsSection>
  );
};
