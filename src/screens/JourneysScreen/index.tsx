import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useMemo, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useGetJourneysQuery, type JourneyListItem } from '@/api/journeys.api';
import { Fab } from '@/components/buttons';
import { Screen } from '@/components/layout';
import { useWindowClass } from '@/hooks/useWindowClass';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { SCREENS } from '@/Navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectJourneyFilter,
  selectSelectedJourneyId,
  setJourneyFilter,
  setSelectedJourneyId,
} from '@/store/slices';
import { sizes } from '@/theme/layout';
import { durations } from '@/theme/motion';
import { columnsForWidth } from '@/utils/grid.util';
import {
  buildJourneyListRows,
  filterJourneys,
  journeysCaption,
  journeyYears,
  orderJourneysForGrid,
} from '@/utils/journey.util';
import {
  FilterBar,
  GRID_GAP,
  JourneyGrid,
  JourneyPanel,
  JourneyRows,
  JourneysHeader,
  ListEmpty,
} from './subcomponents';
import { styles } from './style';

/** Narrowest a grid card may get before the grid drops a column. */
const MIN_CARD_WIDTH = 240;

/**
 * Journeys tab. Phone: the ongoing journey as a hero, then rows grouped by year. Wider windows: a card
 * grid, and from the expanded size a side panel that previews the selected journey.
 */
export const JourneysScreen = (): ReactNode => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const filter = useAppSelector(selectJourneyFilter);
  const selectedId = useAppSelector(selectSelectedJourneyId);
  const { windowClass, bottomChrome, margin, width } = useWindowClass();
  const { data, isLoading, isError, refetch } = useGetJourneysQuery();

  const isCompact = windowClass === 'compact';
  const showPanel = windowClass === 'expanded';

  // Width of the list pane (window minus rail and panel), measured once laid out; the guess avoids a flash.
  const [paneWidth, setPaneWidth] = useState(
    width - (isCompact ? 0 : sizes.railWidth) - (showPanel ? sizes.panelWidth : 0),
  );
  const onPaneLayout = (event: LayoutChangeEvent): void =>
    setPaneWidth(event.nativeEvent.layout.width);

  const journeys = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => filterJourneys(journeys, filter), [journeys, filter]);
  const rows = useMemo(() => buildJourneyListRows(filtered), [filtered]);
  const gridJourneys = useMemo(() => orderJourneysForGrid(filtered), [filtered]);
  const years = useMemo(() => journeyYears(journeys), [journeys]);
  // A filter can hide the selection; then the first visible journey (the ongoing one if shown) stands in.
  const selected = useMemo(
    () => gridJourneys.find((journey) => journey.id === selectedId) ?? gridJourneys[0] ?? null,
    [gridJourneys, selectedId],
  );

  const columns = columnsForWidth(paneWidth, { margin, gap: GRID_GAP, minItem: MIN_CARD_WIDTH });

  const startJourney = (): void => navigation.navigate(SCREENS.JourneyForm);
  const openJourney = (journey: JourneyListItem): void =>
    navigation.navigate(SCREENS.JourneyDetail, { journeyId: journey.id });
  const openMemory = (stopId: string): void =>
    navigation.navigate(SCREENS.MemoryDetail, { stopId });
  // With the panel a tap previews the journey; without it a tap opens it.
  const pressJourney = (journey: JourneyListItem): void => {
    if (showPanel) dispatch(setSelectedJourneyId(journey.id));
    else openJourney(journey);
  };

  const header = (
    <>
      <JourneysHeader caption={journeysCaption(journeys)} />
      {journeys.length > 0 ? (
        <FilterBar
          filter={filter}
          years={years}
          onChange={(next) => dispatch(setJourneyFilter(next))}
        />
      ) : null}
    </>
  );
  const empty = (
    <ListEmpty
      isLoading={isLoading}
      isError={isError}
      hasJourneys={journeys.length > 0}
      onRetry={refetch}
      onStart={startJourney}
      onShowAll={() => dispatch(setJourneyFilter('all'))}
    />
  );
  // Room for the floating tab bar, and the FAB above it, on phones.
  const paddingBottom = bottomChrome + (isCompact ? sizes.fab : 0);

  return (
    <Screen padded={false}>
      <View style={styles.root}>
        <Animated.View
          style={styles.pane}
          onLayout={onPaneLayout}
          entering={FadeIn.duration(durations.base)}
        >
          {isCompact ? (
            <JourneyRows
              rows={rows}
              header={header}
              empty={empty}
              margin={margin}
              paddingBottom={paddingBottom}
              onPressJourney={pressJourney}
            />
          ) : (
            <JourneyGrid
              journeys={gridJourneys}
              columns={columns}
              selectedId={showPanel ? (selected?.id ?? null) : null}
              header={header}
              empty={empty}
              margin={margin}
              paddingBottom={paddingBottom}
              onPressJourney={pressJourney}
            />
          )}
          {isCompact ? (
            <View style={[styles.fab, { right: margin }]}>
              <Fab onPress={startJourney} />
            </View>
          ) : null}
        </Animated.View>
        {showPanel ? (
          <JourneyPanel journey={selected} onOpenJourney={openJourney} onOpenMemory={openMemory} />
        ) : null}
      </View>
    </Screen>
  );
};
