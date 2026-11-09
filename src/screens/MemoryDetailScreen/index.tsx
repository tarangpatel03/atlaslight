import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetJourneyQuery } from '@/api/journeys.api';
import { useDeleteStopMutation, useGetStopQuery } from '@/api/stops.api';
import { EmptyState } from '@/components/feedback';
import { Screen, SidePanelFrame } from '@/components/layout';
import { ConfirmSheet, type AppBottomSheetRef } from '@/components/surfaces';
import { useWindowClass } from '@/hooks/useWindowClass';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { SCREENS } from '@/Navigation/routes';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { formatMemoryDeletion } from '@/utils/memory.util';
import { showToast } from '@/utils/toast.util';
import { MemoryDetailBody } from './subcomponents';
import { styles } from './style';

type MemoryDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREENS.MemoryDetail
>;

/** One memory. Phone: a full screen. Wider windows: a panel on the right over the journey it belongs to. */
export const MemoryDetailScreen = ({ navigation, route }: MemoryDetailScreenProps): ReactNode => {
  const { stopId } = route.params;
  const root = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { windowClass, margin } = useWindowClass();
  const panel = windowClass !== 'compact';
  const gutter = panel ? space[6] : margin;
  // Set while a delete runs: the memory must not be reloaded once it is gone.
  const [deleting, setDeleting] = useState(false);
  const { data: stop, isError } = useGetStopQuery(stopId, { skip: deleting });
  const { data: journey } = useGetJourneyQuery(stop?.journeyId ?? '', { skip: !stop });
  const [deleteStop, { isLoading: deletingNow }] = useDeleteStopMutation();
  const deleteSheet = useRef<AppBottomSheetRef>(null);
  const close = (): void => navigation.goBack();

  const confirmDelete = async (): Promise<void> => {
    if (!stop) return;
    setDeleting(true);
    try {
      await deleteStop({ id: stop.id, journeyId: stop.journeyId }).unwrap();
      deleteSheet.current?.close();
      showToast.success('Memory deleted');
      close();
    } catch (e) {
      setDeleting(false);
      showToast.error("Couldn't delete the memory", e instanceof Error ? e.message : undefined);
    }
  };

  const status = (
    <View style={styles.status}>
      {isError ? (
        <EmptyState
          title="Couldn't open this memory"
          message="It may have been deleted."
          actionLabel="Close"
          onAction={close}
        />
      ) : (
        <ActivityIndicator color={colors.amber} />
      )}
    </View>
  );

  const overlay = stop ? (
    <ConfirmSheet
      ref={deleteSheet}
      title={`Delete ${stop.title}?`}
      message={formatMemoryDeletion(stop.media.length)}
      confirmLabel="Delete memory"
      destructive
      loading={deletingNow}
      onConfirm={() => void confirmDelete()}
      onCancel={() => deleteSheet.current?.close()}
    />
  ) : null;

  const content = stop ? (
    <MemoryDetailBody
      stop={stop}
      journeyTitle={journey?.title}
      panel={panel}
      gutter={gutter}
      onClose={close}
      onEdit={() =>
        root.navigate(SCREENS.MemoryForm, { journeyId: stop.journeyId, stopId: stop.id })
      }
      onDelete={() => deleteSheet.current?.snapToIndex(0)}
    />
  ) : (
    status
  );

  if (panel) {
    return (
      <SidePanelFrame onClose={close} overlay={overlay}>
        <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {content}
        </View>
      </SidePanelFrame>
    );
  }

  return (
    <View style={styles.root}>
      <Screen padded={false}>{content}</Screen>
      {overlay}
    </View>
  );
};
