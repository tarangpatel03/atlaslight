import { endOfDay, startOfDay } from 'date-fns';
import { routeDistanceKm } from '@/utils/geo.util';

/** A photo from the device library that carries a GPS position. */
export type LocatedPhoto = {
  id: string;
  uri: string;
  /** Capture time in ms. */
  takenAt: number;
  latitude: number;
  longitude: number;
};

/** Photos taken in one place at about one time: what "Found in your photos" offers. */
export type PhotoSuggestion = {
  id: string;
  latitude: number;
  longitude: number;
  /** When the first photo of the group was taken. */
  takenAt: number;
  photoCount: number;
  coverUri: string;
};

/** Photos within this distance and time of a group's first photo belong to it. */
const GROUP_RADIUS_KM = 1;
const GROUP_GAP_MS = 12 * 60 * 60 * 1000;
const MAX_SUGGESTIONS = 6;

/** The span photos are searched in: the journey's first day to its last day (to `now` while ongoing). */
export const journeyPhotoWindow = (
  startDate: number,
  endDate: number | null,
  now: number,
): { from: number; to: number } => ({
  from: startOfDay(startDate).getTime(),
  to: endDate === null ? now : endOfDay(endDate).getTime(),
});

/** Groups photos by place and time, newest group first (at most 6). */
export const groupPhotosByPlace = (photos: LocatedPhoto[]): PhotoSuggestion[] => {
  const groups: PhotoSuggestion[] = [];
  for (const photo of [...photos].sort((a, b) => a.takenAt - b.takenAt)) {
    const group = groups.find(
      (candidate) =>
        photo.takenAt - candidate.takenAt <= GROUP_GAP_MS &&
        routeDistanceKm([candidate, photo]) <= GROUP_RADIUS_KM,
    );
    if (group) {
      group.photoCount += 1;
    } else {
      groups.push({
        id: photo.id,
        latitude: photo.latitude,
        longitude: photo.longitude,
        takenAt: photo.takenAt,
        photoCount: 1,
        coverUri: photo.uri,
      });
    }
  }
  return groups.sort((a, b) => b.takenAt - a.takenAt).slice(0, MAX_SUGGESTIONS);
};
