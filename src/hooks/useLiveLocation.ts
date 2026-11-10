import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { getCurrentLocation, watchLocation } from '@/services/location.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectLocationStatus,
  selectUserPosition,
  setLocationStatus,
  setUserPosition,
  type LocationStatus,
  type UserPosition,
} from '@/store/slices';

export type LiveLocationController = {
  status: LocationStatus;
  position: UserPosition | null;
  /** First tap asks for permission and finds you; later taps bring the camera back to you. */
  locate: () => Promise<void>;
  /** Closes the denied / unavailable notice. */
  dismiss: () => void;
};

/**
 * Live location of the Map screen. The position is only followed while live location is on and the
 * Map tab is showing, so leaving the tab stops the GPS. Takes the camera move from the screen.
 */
export const useLiveLocation = (
  flyToPoint: (latitude: number, longitude: number) => void,
): LiveLocationController => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectLocationStatus);
  const position = useAppSelector(selectUserPosition);
  const focused = useIsFocused();
  const following = status === 'on' && focused;

  useEffect(() => {
    if (!following) return undefined;
    return watchLocation(
      (point) => dispatch(setUserPosition(point)),
      (failure) => dispatch(setLocationStatus(failure)),
    );
  }, [dispatch, following]);

  const locate = async (): Promise<void> => {
    if (status === 'locating') return;
    if (status === 'on' && position) {
      flyToPoint(position.latitude, position.longitude);
      return;
    }
    dispatch(setLocationStatus('locating'));
    const result = await getCurrentLocation();
    if (result.status !== 'ok') {
      dispatch(setLocationStatus(result.status));
      return;
    }
    const { latitude, longitude } = result;
    dispatch(setLocationStatus('on'));
    dispatch(setUserPosition({ latitude, longitude }));
    flyToPoint(latitude, longitude);
  };

  const dismiss = (): void => {
    dispatch(setLocationStatus('off'));
  };

  return { status, position, locate, dismiss };
};
