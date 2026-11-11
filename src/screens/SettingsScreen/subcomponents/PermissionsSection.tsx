import type { ReactNode } from 'react';
import { Linking } from 'react-native';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import type { PermissionStatus } from '@/services/permissions.service';
import { colors } from '@/theme/colors';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';

interface PermissionsSectionProps {
  /** Null while it is being read. */
  status: PermissionStatus | null;
}

const statusText = (allowed: boolean | undefined): ReactNode => (
  <AppText variant="caption" color={allowed ? colors.auroraTeal : colors.inkMuted}>
    {allowed === undefined ? '...' : allowed ? 'Allowed' : 'Not allowed'}
  </AppText>
);

/** What the app may use, with a shortcut to the system page where it can be changed. */
export const PermissionsSection = ({ status }: PermissionsSectionProps): ReactNode => (
  <SettingsSection title="Permissions">
    <SettingsRow
      label="Photos"
      detail="Used to find where your photos were taken"
      right={statusText(status?.photos)}
    />
    <SettingsRow
      label="Location"
      detail="Used for your position on the map"
      right={statusText(status?.location)}
    />
    <AppButton
      label="Open app settings"
      variant="secondary"
      onPress={() => void Linking.openSettings()}
    />
  </SettingsSection>
);
