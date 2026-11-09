import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useGetJourneyQuery } from '@/api/journeys.api';
import { EmptyState } from '@/components/feedback';
import { FormFrame } from '@/components/layout';
import { useWindowClass } from '@/hooks/useWindowClass';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { SCREENS } from '@/Navigation/routes';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { JourneyForm } from './subcomponents';
import { styles } from './style';

type JourneyFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREENS.JourneyForm
>;

/** New journey (no id) or edit journey (`journeyId`): a full screen on phones, a dialog on wider windows. */
export const JourneyFormScreen = ({ navigation, route }: JourneyFormScreenProps): ReactNode => {
  const journeyId = route.params?.journeyId;
  const isEdit = journeyId !== undefined;
  const { windowClass, margin } = useWindowClass();
  const dialog = windowClass !== 'compact';
  const gutter = dialog ? space[6] : margin;
  // Set while a delete runs: the journey must not be reloaded once it is gone.
  const [deleting, setDeleting] = useState(false);
  const { data: journey, isError } = useGetJourneyQuery(journeyId ?? '', {
    skip: !isEdit || deleting,
  });
  const close = (): void => navigation.goBack();

  // Editing waits for the journey, so the form starts with its real values.
  if (isEdit && !journey) {
    return (
      <FormFrame title="Edit journey" dialog={dialog} gutter={gutter} onClose={close}>
        <View style={styles.status}>
          {isError ? (
            <EmptyState
              title="Couldn't open this journey"
              message="It may have been deleted."
              actionLabel="Close"
              onAction={close}
            />
          ) : (
            <ActivityIndicator color={colors.amber} />
          )}
        </View>
      </FormFrame>
    );
  }

  return (
    <JourneyForm
      key={journey?.id ?? 'new'}
      journey={journey ?? null}
      dialog={dialog}
      gutter={gutter}
      onClose={close}
      onDeleting={setDeleting}
    />
  );
};
