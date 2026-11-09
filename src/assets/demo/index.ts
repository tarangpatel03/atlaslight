import landscapePhoto from './photos/demo_landscape.jpg';
import portraitPhoto from './photos/demo_portrait.jpg';

// Sample photos for the Kit screen. The demo journeys (Load demo journeys in Settings) copy the same
// files out of the native resources that `npx react-native-asset` links from the photos folder, so a
// release build can read them too. Only photos go in photos/ (everything in it gets linked). Resource names are one flat namespace: keep them `demo_<name>.jpg`.
export { landscapePhoto, portraitPhoto };

export type DemoPhotoKey = 'landscape' | 'portrait';

/** `file` is the linked resource name; the size is read once here instead of decoding the file. */
export const DEMO_PHOTOS: Record<DemoPhotoKey, { file: string; width: number; height: number }> = {
  landscape: { file: 'demo_landscape.jpg', width: 552, height: 362 },
  portrait: { file: 'demo_portrait.jpg', width: 452, height: 678 },
};
