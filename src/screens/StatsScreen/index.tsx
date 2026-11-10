import { useMemo, useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useGetStatsDataQuery } from '@/api/stats.api';
import { EmptyState } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { useWindowClass } from '@/hooks/useWindowClass';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectStatsFilter, selectUnits, setStatsFilter } from '@/store/slices';
import { journeyYears } from '@/utils/journey.util';
import { computeStats, type StatsFilter } from '@/utils/stats.util';
import { PhoneLayout, StatsHeader, StatsSkeleton, WideLayout } from './subcomponents';
import { styles } from './style';

/**
 * Stats tab: how far, where and how often you have travelled, for all time or one year.
 * Windows from 900 dp get the 2-column dashboard; narrower ones a single column.
 */
export const StatsScreen = (): ReactNode => {
  const dispatch = useAppDispatch();
  const filter = useAppSelector(selectStatsFilter);
  const units = useAppSelector(selectUnits);
  const { windowClass, bottomChrome, margin, width } = useWindowClass();
  const { data, isLoading, refetch, isError } = useGetStatsDataQuery();

  // Read once so rendering stays pure; days away and "new this year" are measured from it.
  const [now] = useState(() => Date.now());
  const years = useMemo(() => (data ? journeyYears(data.journeys) : []), [data]);
  // A year whose journeys were all deleted no longer has a chip; show all time instead.
  const effective: StatsFilter = filter === 'all' || years.includes(filter) ? filter : 'all';
  const stats = useMemo(
    () => (data ? computeStats(data.journeys, data.stops, effective, now) : null),
    [data, effective, now],
  );

  const renderBody = (): ReactNode => {
    if (isLoading) {
      return (
        <>
          <StatsHeader since={null} />
          <StatsSkeleton />
        </>
      );
    }
    if (isError || !data || !stats) {
      return (
        <View style={styles.center}>
          <EmptyState
            title="Couldn't load your stats"
            message="Something went wrong reading them from this device."
            actionLabel="Try again"
            onAction={refetch}
          />
        </View>
      );
    }
    if (data.stops.length === 0) {
      return (
        <View style={styles.center}>
          <EmptyState
            title="Nothing to measure yet"
            message="Distance and countries show up once you have a journey."
          />
        </View>
      );
    }

    const perYear = stats.journeysPerYear;
    const highlightYear =
      effective === 'all'
        ? perYear.length > 0
          ? perYear[perYear.length - 1].year
          : stats.basisYear
        : effective;
    const body = {
      stats,
      years,
      filter: effective,
      units,
      highlightYear,
      onFilterChange: (next: StatsFilter) => dispatch(setStatsFilter(next)),
    };

    return windowClass === 'expanded' ? (
      <WideLayout {...body} />
    ) : (
      <PhoneLayout {...body} width={width - 2 * margin} />
    );
  };

  return (
    <Screen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingHorizontal: margin, paddingBottom: bottomChrome },
        ]}
      >
        {renderBody()}
      </ScrollView>
    </Screen>
  );
};
