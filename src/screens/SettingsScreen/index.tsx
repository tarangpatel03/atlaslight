import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useLoadDemoJourneysMutation } from '@/api/demo.api';
import { AppButton } from '@/components/buttons';
import { EmptyState } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { SCREENS } from '@/Navigation/routes';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { formatCount } from '@/utils/format.util';
import { showToast } from '@/utils/toast.util';
import { styles } from './style';

/** Placeholder until settings arrive (Phase 6). Holds Load demo journeys; dev builds also open the UI kit. */
export const SettingsScreen = (): ReactNode => {
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
    <Screen>
      <View style={styles.root}>
        <EmptyState title="Settings" message="Units, map options and backup will live here." />
        <AppButton
          label="Load demo journeys"
          variant="secondary"
          loading={isLoading}
          onPress={onLoadDemo}
        />
        {__DEV__ ? (
          <AppButton
            label="Open UI kit"
            variant="secondary"
            onPress={() => navigation.navigate(SCREENS.Kit)}
          />
        ) : null}
      </View>
    </Screen>
  );
};
