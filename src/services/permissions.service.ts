import { PermissionsAndroid, Platform } from 'react-native';

export interface PermissionStatus {
  photos: boolean;
  location: boolean;
}

/**
 * Whether photo and location access are currently allowed, for the Settings shortcuts.
 * Limited photo access on Android 14 counts as allowed, as in the photo search. iOS reports
 * allowed because it asks at first use and has no check without another package.
 */
export const getPermissionStatus = async (): Promise<PermissionStatus> => {
  if (Platform.OS !== 'android') return { photos: true, location: true };
  const { PERMISSIONS } = PermissionsAndroid;
  const photoReads =
    Platform.Version >= 34
      ? [PERMISSIONS.READ_MEDIA_IMAGES, PERMISSIONS.READ_MEDIA_VISUAL_USER_SELECTED]
      : Platform.Version >= 33
        ? [PERMISSIONS.READ_MEDIA_IMAGES]
        : [PERMISSIONS.READ_EXTERNAL_STORAGE];
  const [photoChecks, fine, coarse] = await Promise.all([
    Promise.all(photoReads.map((permission) => PermissionsAndroid.check(permission))),
    PermissionsAndroid.check(PERMISSIONS.ACCESS_FINE_LOCATION),
    PermissionsAndroid.check(PERMISSIONS.ACCESS_COARSE_LOCATION),
  ]);
  return { photos: photoChecks.some(Boolean), location: fine || coarse };
};
