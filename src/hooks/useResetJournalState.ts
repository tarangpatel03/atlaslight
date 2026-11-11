import { useCallback } from 'react';
import { baseApi } from '@/api/baseApi';
import { useAppDispatch } from '@/store/hooks';
import {
  setJourneyFilter,
  setMapFilter,
  setSelectedJourneyId,
  setSelectedStopId,
  setStatsFilter,
} from '@/store/slices';

/**
 * Returns a function to call after the whole journal was replaced or emptied (Delete all, a restore):
 * the query cache still holds the old rows and the Map, Journeys and Stats selections may point at them.
 */
export const useResetJournalState = (): (() => void) => {
  const dispatch = useAppDispatch();
  return useCallback(() => {
    dispatch(baseApi.util.resetApiState());
    dispatch(setMapFilter({ kind: 'all' }));
    dispatch(setSelectedStopId(null));
    dispatch(setSelectedJourneyId(null));
    dispatch(setJourneyFilter('all'));
    dispatch(setStatsFilter('all'));
  }, [dispatch]);
};
