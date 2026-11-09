import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { AppButton } from '@/components/buttons';
import { EmptyState } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { SCREENS } from '@/Navigation/routes';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { styles } from './style';

/** Placeholder until settings arrive (Phase 6). In dev builds it also opens the UI kit. */
export const SettingsScreen = (): ReactNode => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Screen>
      <View style={styles.root}>
        <EmptyState title="Settings" message="Units, map options and backup will live here." />
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
