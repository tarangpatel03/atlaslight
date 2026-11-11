import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { JOURNEY_NOT_FOUND, useGetJourneyQuery } from '@/api/journeys.api';
import {
  useGetStopsByJourneyQuery,
  useReorderStopsMutation,
  type StopListItem,
} from '@/api/stops.api';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { DetailSkeleton, EmptyState } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { useWindowClass } from '@/hooks/useWindowClass';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { SCREENS } from '@/Navigation/routes';
import { useAppSelector } from '@/store/hooks';
import { selectUnits } from '@/store/slices';
import { colors } from '@/theme/colors';
import { showToast } from '@/utils/toast.util';
import { DetailHero, JourneyBody, Timeline } from './subcomponents';
import { styles } from './style';

type JourneyDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREENS.JourneyDetail
>;

const HERO_HEIGHT_PHONE = 260;
const HERO_HEIGHT_TABLET = 220;
const MAP_HEIGHT_PHONE = 220;
const MAP_HEIGHT_TABLET = 320;

/**
 * One journey. Phone: hero, numbers, route map and the timeline in one scroll, with Add memory pinned
 * below. Tablet: a hero band, then the numbers and route map beside the timeline.
 */
export const JourneyDetailScreen = ({ route }: JourneyDetailScreenProps): ReactNode => {
  const { journeyId } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const units = useAppSelector(selectUnits);
  const { windowClass, margin } = useWindowClass();
  const isCompact = windowClass === 'compact';

  const { data: journey, isError, error } = useGetJourneyQuery(journeyId);
  const { data: stops } = useGetStopsByJourneyQuery(journeyId);
  const [reorderStops] = useReorderStopsMutation();

  // The journey is gone (deleted from its edit form): leave instead of flashing an error.
  const gone =
    isError && error !== undefined && 'message' in error && error.message === JOURNEY_NOT_FOUND;
  useEffect(() => {
    if (gone) navigation.goBack();
  }, [gone, navigation]);

  const goBack = (): void => navigation.goBack();
  const edit = (): void => navigation.navigate(SCREENS.JourneyForm, { journeyId });
  const addMemory = (): void => navigation.navigate(SCREENS.MemoryForm, { journeyId });
  const openMemory = (stop: StopListItem): void =>
    navigation.navigate(SCREENS.MemoryDetail, { stopId: stop.id });
  const reorder = (orderedIds: string[]): void => {
    reorderStops({ journeyId, orderedIds })
      .unwrap()
      .catch(() => showToast.error("Couldn't save the new order"));
  };

  if (!journey || !stops) {
    return (
      <Screen padded={false}>
        <View style={styles.status}>
          {isError && !gone ? (
            <EmptyState
              title="Couldn't open this journey"
              message="Something went wrong reading it from this device."
              actionLabel="Close"
              onAction={goBack}
            />
          ) : (
            <DetailSkeleton />
          )}
        </View>
      </Screen>
    );
  }

  const empty = (
    <EmptyState
      title="No memories yet"
      message="Add the first moment of this journey."
      actionLabel="Add memory"
      onAction={addMemory}
    />
  );
  const hero = (
    <DetailHero
      journey={journey}
      height={isCompact ? HERO_HEIGHT_PHONE : HERO_HEIGHT_TABLET}
      gutter={margin}
      onBack={goBack}
      onEdit={edit}
    />
  );
  const body = (
    <JourneyBody
      journey={journey}
      units={units}
      gutter={isCompact ? margin : 0}
      stops={stops}
      mapHeight={isCompact ? MAP_HEIGHT_PHONE : MAP_HEIGHT_TABLET}
      onOpenMemory={(stopId) => navigation.navigate(SCREENS.MemoryDetail, { stopId })}
    />
  );
  const timelineTitle = (
    <AppText variant="overline" color={colors.inkMuted}>
      Timeline
    </AppText>
  );

  if (isCompact) {
    return (
      <Screen padded={false}>
        <View style={styles.root}>
          <Timeline
            stops={stops}
            gutter={margin}
            paddingBottom={margin}
            onReorder={reorder}
            onOpenMemory={openMemory}
            empty={empty}
            header={
              // The list pads its sides, the hero and body bleed to the screen edge.
              <View style={{ marginHorizontal: -margin }}>
                {hero}
                {body}
                <View style={[styles.timelineHeader, { paddingHorizontal: margin }]}>
                  {timelineTitle}
                </View>
              </View>
            }
          />
          <View style={styles.footer}>
            <AppButton label="Add memory" onPress={addMemory} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.root}>
        {hero}
        <View style={styles.split}>
          <ScrollView
            style={styles.overview}
            contentContainerStyle={{ paddingHorizontal: margin, paddingBottom: margin }}
            showsVerticalScrollIndicator={false}
          >
            {body}
          </ScrollView>
          <View style={styles.timelinePane}>
            <Timeline
              stops={stops}
              gutter={margin}
              paddingBottom={margin}
              onReorder={reorder}
              onOpenMemory={openMemory}
              empty={empty}
              header={
                <View style={styles.timelineHeader}>
                  <View style={styles.timelineTitleRow}>
                    {timelineTitle}
                    <AppButton label="Add memory" variant="secondary" onPress={addMemory} />
                  </View>
                </View>
              }
            />
          </View>
        </View>
      </View>
    </Screen>
  );
};
