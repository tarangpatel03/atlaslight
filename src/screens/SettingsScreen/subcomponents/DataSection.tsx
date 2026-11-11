import type { ReactNode } from 'react';
import { AppText } from '@/components/brand';
import type { StorageSizes } from '@/services/storageInfo.service';
import { colors } from '@/theme/colors';
import { formatBytes } from '@/utils/format.util';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';

interface DataSectionProps {
  /** Null while it is being read. */
  sizes: StorageSizes | null;
  /** The sizes could not be read. */
  failed: boolean;
}

const sizeText = (bytes: number | undefined, failed: boolean): ReactNode => (
  <AppText variant="caption" color={colors.inkMuted}>
    {bytes !== undefined ? formatBytes(bytes) : failed ? 'Unavailable' : '...'}
  </AppText>
);

/** How much room the journal takes on this phone. Backup and Delete all join it later. */
export const DataSection = ({ sizes, failed }: DataSectionProps): ReactNode => (
  <SettingsSection title="Data">
    <SettingsRow
      label="Journal database"
      detail="Journeys, memories and places"
      right={sizeText(sizes?.databaseBytes, failed)}
    />
    <SettingsRow
      label="Photos and videos"
      detail="Copies kept on this phone, with thumbnails"
      right={sizeText(sizes?.mediaBytes, failed)}
    />
  </SettingsSection>
);
