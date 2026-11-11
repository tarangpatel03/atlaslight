import { useEffect, useRef, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { Screen } from '@/components/layout';
import type { AppBottomSheetRef } from '@/components/surfaces';
import { useBackupRestore } from '@/hooks/useBackupRestore';
import { useDeviceStatus } from '@/hooks/useDeviceStatus';
import { useWindowClass } from '@/hooks/useWindowClass';
import { sizes as layoutSizes, space } from '@/theme/layout';
import {
  AboutSection,
  BackupSection,
  DataSection,
  DeleteAllSection,
  DeleteAllSheet,
  MapSection,
  PermissionsSection,
  ProfileSection,
  RestoreSheet,
  UnitsSection,
} from './subcomponents';
import { styles } from './style';

// The floating phone tab bar and the gap above it; a sheet rests above them.
const TAB_CLEARANCE = layoutSizes.tabBarHeight + space[4];

/** Settings tab: profile, distance units, map layers, permissions, data sizes, about and Delete all. */
export const SettingsScreen = (): ReactNode => {
  const { windowClass, margin, bottomChrome } = useWindowClass();
  const { sizes, permissions, sizesFailed, reloadSizes } = useDeviceStatus();
  const deleteSheet = useRef<AppBottomSheetRef>(null);
  const restoreSheet = useRef<AppBottomSheetRef>(null);
  const restore = useBackupRestore(reloadSizes);
  const hasPending = restore.pending !== null;
  const sheetInset = windowClass === 'compact' ? TAB_CLEARANCE + space[2] : space[4];

  // The restore sheet opens once a backup has passed its checks and closes when it is settled.
  useEffect(() => {
    if (hasPending) restoreSheet.current?.snapToIndex(0);
    else restoreSheet.current?.close();
  }, [hasPending]);

  return (
    <Screen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingHorizontal: margin, paddingBottom: bottomChrome },
        ]}
      >
        <View style={styles.column}>
          <ProfileSection />
          <UnitsSection />
          <MapSection />
          <PermissionsSection status={permissions} />
          <DataSection sizes={sizes} failed={sizesFailed} />
          <BackupSection
            restoreStatus={restore.status}
            restoreProgress={restore.progress}
            onRestore={() => void restore.pick()}
          />
          <AboutSection />
          <DeleteAllSection onAsk={() => deleteSheet.current?.snapToIndex(0)} />
        </View>
      </ScrollView>
      <RestoreSheet
        ref={restoreSheet}
        message={restore.pending ?? ''}
        loading={restore.status === 'restoring'}
        bottomInset={sheetInset}
        onConfirm={() => void restore.confirm()}
        onCancel={() => void restore.cancel()}
      />
      <DeleteAllSheet
        ref={deleteSheet}
        bottomInset={sheetInset}
        onDeleted={reloadSizes}
        onClose={() => deleteSheet.current?.close()}
      />
    </Screen>
  );
};
