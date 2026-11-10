import { formatCount } from '@/utils/format.util';
import type { MemoryFormValues } from '@/utils/validation.util';

/** The moment `visitedAt` moved to another day (a date field's noon timestamp), keeping its time of day. */
export const mergeDay = (visitedAt: number, pickedDay: number): number => {
  const time = new Date(visitedAt);
  const day = new Date(pickedDay);
  day.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return day.getTime();
};

/** The moment `visitedAt` moved to another time of day, keeping its day. */
export const mergeTime = (visitedAt: number, hours: number, minutes: number): number => {
  const date = new Date(visitedAt);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
};

/** Fields saved with a memory: the note is trimmed and an empty note becomes null. */
export const toStopInput = (
  values: MemoryFormValues,
): Pick<
  MemoryFormValues,
  'title' | 'latitude' | 'longitude' | 'altitude' | 'visitedAt' | 'mood'
> & {
  note: string | null;
} => ({
  title: values.title.trim(),
  latitude: values.latitude,
  longitude: values.longitude,
  altitude: values.altitude,
  visitedAt: values.visitedAt,
  mood: values.mood,
  note: values.note?.trim() ? values.note.trim() : null,
});

/** What deleting a memory removes, for the confirm sheet. */
export const formatMemoryDeletion = (mediaCount: number): string =>
  mediaCount === 0
    ? 'Deletes this memory from this phone.'
    : `Deletes this memory and its ${formatCount(mediaCount, 'photo or video', 'photos and videos')} from this phone.`;

/** `8.7333° N, 76.7000° E`. */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  const lat = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lng = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? 'E' : 'W'}`;
  return `${lat}, ${lng}`;
};

type PlaceParts = {
  name: string;
  locality: string | null;
  adminArea: string | null;
  countryName: string | null;
};

/** The place's name and a second line `locality, state, country` without empty parts or the name repeated. */
export const placeLines = (place: PlaceParts): { name: string; detail: string } => ({
  name: place.name,
  detail: [place.locality, place.adminArea, place.countryName]
    .filter((part): part is string => part !== null && part !== '' && part !== place.name)
    .join(', '),
});
