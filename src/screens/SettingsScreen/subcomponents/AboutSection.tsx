import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { Linking } from 'react-native';
import { useLoadDemoJourneysMutation } from '@/api/demo.api';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { SCREENS } from '@/Navigation/routes';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { colors } from '@/theme/colors';
import { APP_VERSION, SOURCE_URL } from '@/utils/appInfo.util';
import { formatCount } from '@/utils/format.util';
import { showToast } from '@/utils/toast.util';
import { SettingsRow } from './SettingsRow';
import { SettingsSection } from './SettingsSection';

/** Demo data, the source link and the version; dev builds also open the UI kit. */
export const AboutSection = (): ReactNode => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loadDemoJourneys, { isLoading }] = useLoadDemoJourneysMutation();

  const onLoadDemo = async (): Promise<void> => {
    try {
      const { added } = await loadDemoJourneys().unwrap();
      if (added > 0)
        showToast.success(`${formatCount(added, 'demo journey', 'demo journeys')} added.`);
      else showToast.info('Demo journeys are already here.');
    } catch (e) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e ? String(e.message) : undefined;
      showToast.error("Couldn't load the demo journeys", message);
    }
  };

  return (
    <SettingsSection title="About">
      <AppButton
        label="Load demo journeys"
        variant="secondary"
        loading={isLoading}
        onPress={onLoadDemo}
      />
      <SettingsRow
        label="Source code"
        detail="Atlaslight on GitHub"
        onPress={() => void Linking.openURL(SOURCE_URL)}
      />
      <SettingsRow
        label="Version"
        right={
          <AppText variant="caption" color={colors.inkMuted}>
            {APP_VERSION}
          </AppText>
        }
      />
      {__DEV__ ? (
        <AppButton
          label="Open UI kit"
          variant="secondary"
          onPress={() => navigation.navigate(SCREENS.Kit)}
        />
      ) : null}
    </SettingsSection>
  );
};
