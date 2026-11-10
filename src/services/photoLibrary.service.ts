import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { PermissionsAndroid, Platform } from 'react-native';
import { cleanAltitude } from '@/utils/geo.util';
import type { LocatedPhoto } from '@/utils/photoSuggestion.util';

/** Most photos read for one search; reading a location per photo is slow on Android. */
const MAX_PHOTOS = 200;

export type PhotoAccess = 'granted' | 'denied';

const wasGranted = (result: string): boolean => result === PermissionsAndroid.RESULTS.GRANTED;

/**
 * Asks for the photo library and for the photos' location (without it Android hides every GPS tag).
 * iOS asks by itself when the library is first read.
 */
export const requestPhotoAccess = async (): Promise<PhotoAccess> => {
  if (Platform.OS !== 'android') return 'granted';
  const { PERMISSIONS } = PermissionsAndroid;
  // Android 14 can grant only the photos the user picks ("limited access"), which counts as access here;
  // it needs READ_MEDIA_VISUAL_USER_SELECTED in the request to offer that choice.
  const reads =
    Platform.Version >= 34
      ? [PERMISSIONS.READ_MEDIA_IMAGES, PERMISSIONS.READ_MEDIA_VISUAL_USER_SELECTED]
      : Platform.Version >= 33
        ? [PERMISSIONS.READ_MEDIA_IMAGES]
        : [PERMISSIONS.READ_EXTERNAL_STORAGE];
  // Already allowed (fully or limited): do not ask again, each ask reopens the picker for limited access.
  const already = await Promise.all(
    reads.map((permission) => PermissionsAndroid.check(permission)),
  );
  if (already.some(Boolean)) return 'granted';
  const results = await PermissionsAndroid.requestMultiple([
    ...reads,
    PERMISSIONS.ACCESS_MEDIA_LOCATION,
  ]);
  return reads.some((permission) => wasGranted(results[permission])) ? 'granted' : 'denied';
};

/** Photos taken between the two times (ms) that have a GPS position, newest first. */
export const findLocatedPhotos = async (
  fromTime: number,
  toTime: number,
): Promise<LocatedPhoto[]> => {
  const { edges } = await CameraRoll.getPhotos({
    first: MAX_PHOTOS,
    assetType: 'Photos',
    // `fromTime` is exclusive; one ms earlier keeps a photo taken exactly at the start.
    fromTime: fromTime - 1,
    toTime,
    include: ['location'],
  });
  const photos: LocatedPhoto[] = [];
  for (const { node } of edges) {
    const { location } = node;
    // 0, 0 is what a missing or hidden GPS tag turns into.
    if (!location) continue;
    const { latitude, longitude } = location;
    if (latitude === undefined || longitude === undefined) continue;
    if (latitude === 0 && longitude === 0) continue;
    photos.push({
      id: node.id,
      uri: node.image.uri,
      takenAt: node.timestamp * 1000,
      latitude,
      longitude,
      altitude: cleanAltitude(location.altitude),
    });
  }
  return photos;
};
