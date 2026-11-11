import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useGetJourneysQuery } from '@/api/journeys.api';
import { useGetStopQuery } from '@/api/stops.api';
import { DetailSkeleton, EmptyState } from '@/components/feedback';
import { FormFrame } from '@/components/layout';
import { useWindowClass } from '@/hooks/useWindowClass';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { SCREENS } from '@/Navigation/routes';
import { space } from '@/theme/layout';
import { MemoryForm } from './subcomponents';
import { styles } from './style';

type MemoryFormScreenProps = NativeStackScreenProps<RootStackParamList, typeof SCREENS.MemoryForm>;

/** New memory (no `stopId`) or edit memory: a full screen on phones, a dialog on wider windows. */
export const MemoryFormScreen = ({ navigation, route }: MemoryFormScreenProps): ReactNode => {
  const stopId = route.params?.stopId;
  const isEdit = stopId !== undefined;
  const { windowClass, margin } = useWindowClass();
  const dialog = windowClass !== 'compact';
  const gutter = dialog ? space[6] : margin;
  // Set while a delete runs: the memory must not be reloaded once it is gone.
  const [deleting, setDeleting] = useState(false);
  const { data: stop, isError } = useGetStopQuery(stopId ?? '', { skip: !isEdit || deleting });
  const { data: journeys, isLoading: loadingJourneys } = useGetJourneysQuery();
  const close = (): void => navigation.goBack();
  const title = isEdit ? 'Edit memory' : 'New memory';

  // Editing waits for the memory, so the form starts with its real values.
  if (isEdit && !stop) {
    return (
      <FormFrame title={title} dialog={dialog} gutter={gutter} onClose={close}>
        <View style={styles.status}>
          {isError ? (
            <EmptyState
              title="Couldn't open this memory"
              message="It may have been deleted."
              actionLabel="Close"
              onAction={close}
            />
          ) : (
            <DetailSkeleton />
          )}
        </View>
      </FormFrame>
    );
  }

  // A memory belongs to a journey: with none yet, the way forward is to start one.
  if (!isEdit && !loadingJourneys && (journeys ?? []).length === 0) {
    return (
      <FormFrame title={title} dialog={dialog} gutter={gutter} onClose={close}>
        <View style={styles.status}>
          <EmptyState
            title="Start a journey first"
            message="Memories live inside a journey."
            actionLabel="Start journey"
            onAction={() => navigation.replace(SCREENS.JourneyForm)}
          />
        </View>
      </FormFrame>
    );
  }

  return (
    <MemoryForm
      key={stop?.id ?? 'new'}
      stop={stop ?? null}
      journeyId={route.params?.journeyId}
      dialog={dialog}
      gutter={gutter}
      picked={route.params?.picked}
      onClose={close}
      onDeleting={setDeleting}
    />
  );
};
