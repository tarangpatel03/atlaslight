import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useGetJourneysQuery } from '@/api/journeys.api';
import { useResolvePlaceMutation, useSavePlaceMutation } from '@/api/places.api';
import {
  useAddMediaToStopMutation,
  useCreateStopMutation,
  useDeleteStopMutation,
  useRemoveMediaFromStopMutation,
  useUpdateStopMutation,
  type StopDetail,
} from '@/api/stops.api';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { Chip, DateField, TextField, TimeField } from '@/components/inputs';
import { FormFrame } from '@/components/layout';
import { ConfirmSheet, type AppBottomSheetRef } from '@/components/surfaces';
import { MOODS, type Mood } from '@/db/moods';
import { getCurrentLocation } from '@/services/location.service';
import { pickFromLibrary, captureWithCamera, suggestFromMedia } from '@/services/picker.service';
import type { PickedMedia } from '@/services/picker.service';
import type { RootStackParamList } from '@/Navigation/navigation.types';
import { SCREENS } from '@/Navigation/routes';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import type { PlaceSuggestion } from '@/utils/photon.util';
import { journeyPhotoWindow, type PhotoSuggestion } from '@/utils/photoSuggestion.util';
import { pickOngoing } from '@/utils/journey.util';
import { formatMemoryDeletion, mergeDay, mergeTime, toStopInput } from '@/utils/memory.util';
import { showToast } from '@/utils/toast.util';
import { MAX_MEDIA_PER_ADD, memorySchema, type MemoryFormValues } from '@/utils/validation.util';
import { FoundInPhotos } from './FoundInPhotos';
import { PhotoStrip } from './PhotoStrip';
import { PlaceField } from './PlaceField';

interface MemoryFormProps {
  /** The memory being edited; null adds a new one. */
  stop: StopDetail | null;
  /** The journey a new memory starts in (from where the form was opened); the selector can change it. */
  journeyId: string | undefined;
  dialog: boolean;
  gutter: number;
  onClose: () => void;
  /** A spot chosen on the map screen; the form takes it once and names it. */
  picked?: { latitude: number; longitude: number };
  /** Called with true when a delete starts (and false if it fails), so the screen stops reloading the memory. */
  onDeleting: (deleting: boolean) => void;
}

const messageOf = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'message' in error
    ? String(error.message)
    : undefined;

/** A form value that is a finite number, else undefined (no location chosen yet). */
const finiteOrUndefined = (value: number | undefined): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const moodLabel = (mood: Mood): string => mood.charAt(0).toUpperCase() + mood.slice(1);

/** Form to add a memory or edit one: photos, title, place, when, mood and note. Errors show when a field loses focus. */
export const MemoryForm = ({
  stop,
  journeyId,
  dialog,
  gutter,
  picked: pickedSpot,
  onClose,
  onDeleting,
}: MemoryFormProps): ReactNode => {
  const isEdit = stop !== null;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { data: journeys } = useGetJourneysQuery();
  const [createStop, { isLoading: creating }] = useCreateStopMutation();
  const [updateStop, { isLoading: updating }] = useUpdateStopMutation();
  const [addMedia] = useAddMediaToStopMutation();
  const [removeMedia] = useRemoveMediaFromStopMutation();
  const [deleteStop, { isLoading: deleting }] = useDeleteStopMutation();
  const [resolvePlace] = useResolvePlaceMutation();
  const [savePlace] = useSavePlaceMutation();

  // New memories start now; read once so rendering stays pure.
  const [now] = useState(() => Date.now());
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema),
    mode: 'onBlur',
    defaultValues: {
      title: stop?.title ?? '',
      latitude: stop?.latitude,
      longitude: stop?.longitude,
      altitude: stop?.altitude ?? null,
      visitedAt: stop?.visitedAt ?? now,
      mood: stop?.mood ?? null,
      note: stop?.note ?? '',
      mediaCount: 0,
    },
  });

  const [chosenJourney, setChosenJourney] = useState<string | undefined>(journeyId);
  const [picked, setPicked] = useState<PickedMedia[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [placeId, setPlaceId] = useState<string | null>(stop?.placeId ?? null);
  const [placeName, setPlaceName] = useState<string | null>(stop?.place?.name ?? null);
  const [picking, setPicking] = useState(false);
  // Set once the user changes the day or time by hand, so a photo's time no longer replaces it.
  const [whenTouched, setWhenTouched] = useState(false);
  const deleteSheet = useRef<AppBottomSheetRef>(null);

  const latitude = finiteOrUndefined(useWatch({ control, name: 'latitude' }));
  const longitude = finiteOrUndefined(useWatch({ control, name: 'longitude' }));
  const hasLocation = latitude !== undefined && longitude !== undefined;

  // A new memory goes to the journey it was opened from, else the ongoing one, else the newest.
  const targetJourney = chosenJourney ?? pickOngoing(journeys ?? [])?.id ?? (journeys ?? [])[0]?.id;
  // Where "Found in your photos" looks: the days of the memory's journey.
  const searchJourney = (journeys ?? []).find(
    (item) => item.id === (stop?.journeyId ?? targetJourney),
  );
  const photoWindow = searchJourney
    ? journeyPhotoWindow(searchJourney.startDate, searchJourney.endDate, now)
    : null;
  const stored = (stop?.media ?? [])
    .filter((item) => !removedIds.includes(item.id))
    .map((item) => ({
      id: item.id,
      thumbnailPath: item.thumbnailPath,
      isVideo: item.type === 'video',
    }));

  /** Names the photo's location and fills it in; only while the memory has no location yet. */
  const fillLocationFrom = async (items: PickedMedia[]): Promise<void> => {
    const found = suggestFromMedia(items);
    if (!found) return;
    setValue('latitude', found.latitude, { shouldValidate: true });
    setValue('longitude', found.longitude, { shouldValidate: true });
    setValue('altitude', found.altitude);
    if (found.takenAt && !isEdit && !whenTouched) setValue('visitedAt', found.takenAt);
    try {
      const place = await resolvePlace({
        latitude: found.latitude,
        longitude: found.longitude,
        source: 'exif',
      }).unwrap();
      setPlaceId(place?.id ?? null);
      setPlaceName(place?.name ?? null);
    } catch {
      // The name is a nicety; the coordinates are enough to save.
      setPlaceId(null);
      setPlaceName(null);
    }
  };

  /** A search result the user tapped: cached in `places`, then used as the memory's location. */
  const choosePlace = async (suggestion: PlaceSuggestion): Promise<void> => {
    try {
      const place = await savePlace(suggestion).unwrap();
      setValue('latitude', suggestion.latitude, { shouldValidate: true });
      setValue('longitude', suggestion.longitude, { shouldValidate: true });
      // A searched place has no height of its own, and the old one belonged to the old spot.
      setValue('altitude', null);
      setPlaceId(place.id);
      setPlaceName(place.name);
    } catch (e) {
      showToast.error("Couldn't use this place", messageOf(e));
      throw e;
    }
  };

  /** A point with no search result behind it (map pick, current location): used as is, then named. */
  const applyPoint = useCallback(
    async (point: {
      latitude: number;
      longitude: number;
      /** Only a GPS fix knows it; a map pick clears the old height. */
      altitude?: number | null;
    }): Promise<void> => {
      setValue('latitude', point.latitude, { shouldValidate: true });
      setValue('longitude', point.longitude, { shouldValidate: true });
      setValue('altitude', point.altitude ?? null);
      try {
        const place = await resolvePlace({ ...point, source: 'manual' }).unwrap();
        setPlaceId(place?.id ?? null);
        setPlaceName(place?.name ?? null);
      } catch {
        // The name is a nicety; the coordinates are enough to save.
        setPlaceId(null);
        setPlaceName(null);
      }
    },
    [resolvePlace, setValue],
  );

  // The map screen sends its spot back as a param; each spot is taken once.
  useEffect(() => {
    if (!pickedSpot) return;
    // Deferred a tick: applying the spot sets several form states, which must not happen inside the effect itself.
    const timer = setTimeout(() => {
      void applyPoint(pickedSpot);
      navigation.setParams({ picked: undefined });
    }, 0);
    return () => clearTimeout(timer);
  }, [pickedSpot, applyPoint, navigation]);

  const locateMe = async (): Promise<void> => {
    const result = await getCurrentLocation();
    if (result.status === 'ok') {
      await applyPoint(result);
    } else if (result.status === 'denied') {
      showToast.error('Location is off for Atlaslight', 'Allow it in your phone settings.');
    } else {
      showToast.error("Couldn't find your location", 'Check that location is on and try again.');
    }
  };

  const pickOnMap = (): void =>
    navigation.navigate(SCREENS.MapPick, {
      latitude,
      longitude,
      journeyId: stop?.journeyId ?? targetJourney,
    });

  /** A place found in the photos: its position and time fill the form, then the point is named. */
  const useSuggestion = async (suggestion: PhotoSuggestion): Promise<void> => {
    setValue('latitude', suggestion.latitude, { shouldValidate: true });
    setValue('longitude', suggestion.longitude, { shouldValidate: true });
    setValue('altitude', suggestion.altitude);
    setValue('visitedAt', suggestion.takenAt);
    setWhenTouched(true);
    try {
      const place = await resolvePlace({
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        source: 'exif',
      }).unwrap();
      setPlaceId(place?.id ?? null);
      setPlaceName(place?.name ?? null);
    } catch {
      // The name is a nicety; the coordinates are enough to save.
      setPlaceId(null);
      setPlaceName(null);
    }
  };

  const takePicked = async (items: PickedMedia[]): Promise<void> => {
    if (items.length === 0) return;
    const next = [...picked, ...items].slice(0, MAX_MEDIA_PER_ADD);
    setPicked(next);
    setValue('mediaCount', next.length);
    if (!hasLocation) await fillLocationFrom(items);
  };

  const fromLibrary = async (): Promise<void> => {
    setPicking(true);
    try {
      await takePicked(await pickFromLibrary(MAX_MEDIA_PER_ADD - picked.length));
    } catch (e) {
      showToast.error("Couldn't open your photos", messageOf(e));
    } finally {
      setPicking(false);
    }
  };

  const fromCamera = async (): Promise<void> => {
    if (picked.length >= MAX_MEDIA_PER_ADD) {
      showToast.info(`Add up to ${MAX_MEDIA_PER_ADD} photos at a time`);
      return;
    }
    setPicking(true);
    try {
      const shot = await captureWithCamera('photo');
      if (shot) await takePicked([shot]);
    } catch (e) {
      showToast.error("Couldn't open the camera", messageOf(e));
    } finally {
      setPicking(false);
    }
  };

  const removePicked = (path: string): void => {
    const next = picked.filter((item) => item.path !== path);
    setPicked(next);
    setValue('mediaCount', next.length);
  };

  const save = async (values: MemoryFormValues): Promise<void> => {
    const input = toStopInput(values);
    try {
      if (stop) {
        await updateStop({ id: stop.id, journeyId: stop.journeyId, ...input, placeId }).unwrap();
        if (removedIds.length > 0) {
          await removeMedia({
            stopId: stop.id,
            journeyId: stop.journeyId,
            mediaIds: removedIds,
          }).unwrap();
        }
        if (picked.length > 0) {
          await addMedia({ stopId: stop.id, journeyId: stop.journeyId, media: picked }).unwrap();
        }
        showToast.success('Changes saved');
      } else {
        if (!targetJourney) {
          showToast.error('Start a journey first');
          return;
        }
        await createStop({ journeyId: targetJourney, ...input, placeId, media: picked }).unwrap();
        showToast.success('Memory added');
      }
      onClose();
    } catch (e) {
      showToast.error("Couldn't save the memory", messageOf(e));
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!stop) return;
    // The delete refreshes the memory's tags; without this the screen would try to reload a deleted memory.
    onDeleting(true);
    try {
      await deleteStop({ id: stop.id, journeyId: stop.journeyId }).unwrap();
      deleteSheet.current?.close();
      showToast.success('Memory deleted');
      onClose();
    } catch (e) {
      onDeleting(false);
      showToast.error("Couldn't delete the memory", messageOf(e));
    }
  };

  const overlay = stop ? (
    <ConfirmSheet
      ref={deleteSheet}
      title={`Delete ${stop.title}?`}
      message={formatMemoryDeletion(stop.media.length)}
      confirmLabel="Delete memory"
      destructive
      loading={deleting}
      onConfirm={() => void confirmDelete()}
      onCancel={() => deleteSheet.current?.close()}
    />
  ) : null;

  return (
    <FormFrame
      title={isEdit ? 'Edit memory' : 'New memory'}
      dialog={dialog}
      gutter={gutter}
      onClose={onClose}
      overlay={overlay}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={dialog ? styles.scrollDialog : styles.scroll}
        contentContainerStyle={styles.fields}
      >
        {isEdit ? null : (
          <View style={[styles.group, { paddingHorizontal: gutter }]}>
            <AppText variant="label">Journey</AppText>
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {(journeys ?? []).map((journey) => (
                <Chip
                  key={journey.id}
                  label={journey.title}
                  selected={journey.id === targetJourney}
                  onPress={() => setChosenJourney(journey.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <FoundInPhotos
          // A new window (another journey chosen) starts over instead of showing the old journey's places.
          key={searchJourney?.id ?? 'none'}
          window={photoWindow}
          onUse={useSuggestion}
          gutter={gutter}
        />

        <PhotoStrip
          stored={stored}
          picked={picked}
          gutter={gutter}
          busy={picking || creating || updating}
          onLibrary={() => void fromLibrary()}
          onCamera={() => void fromCamera()}
          onRemoveStored={(id) => setRemovedIds((ids) => [...ids, id])}
          onRemovePicked={removePicked}
        />

        <View style={[styles.group, { paddingHorizontal: gutter }]}>
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Title"
                placeholder="Sunrise at Varkala cliff"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  // Once an error is showing, clear it as soon as the title is fixed instead of waiting for blur.
                  if (errors.title) void trigger('title');
                }}
                onBlur={onBlur}
                error={errors.title?.message}
                maxLength={80}
              />
            )}
          />

          <PlaceField
            selectedLabel={
              hasLocation ? (placeName ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`) : null
            }
            error={errors.latitude?.message}
            onSelect={choosePlace}
            onUseLocation={locateMe}
            onPickOnMap={pickOnMap}
          />

          <Controller
            control={control}
            name="visitedAt"
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={styles.when}>
                <View style={styles.whenField}>
                  <DateField
                    label="Date"
                    value={value}
                    onChange={(day) => {
                      setWhenTouched(true);
                      onChange(mergeDay(value, day));
                    }}
                    onBlur={onBlur}
                    error={errors.visitedAt?.message}
                  />
                </View>
                <View style={styles.whenField}>
                  <TimeField
                    label="Time"
                    value={value}
                    onChange={(hours, minutes) => {
                      setWhenTouched(true);
                      onChange(mergeTime(value, hours, minutes));
                    }}
                    onBlur={onBlur}
                  />
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="mood"
            render={({ field: { value, onChange } }) => (
              <View style={styles.mood}>
                <AppText variant="label">Mood</AppText>
                <View style={styles.moodChips}>
                  {MOODS.map((mood) => (
                    <Chip
                      key={mood}
                      label={moodLabel(mood)}
                      selected={value === mood}
                      onPress={() => onChange(value === mood ? null : mood)}
                    />
                  ))}
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="note"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Note (optional)"
                placeholder="What do you want to remember?"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.note?.message}
                multiline
                maxLength={2000}
              />
            )}
          />

          {isEdit ? (
            <AppButton
              label="Delete memory"
              variant="danger"
              onPress={() => deleteSheet.current?.snapToIndex(0)}
            />
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: gutter }]}>
        {dialog ? (
          <View style={styles.cancel}>
            <AppButton label="Cancel" variant="ghost" onPress={onClose} />
          </View>
        ) : null}
        <View style={styles.save}>
          <AppButton
            label={isEdit ? 'Save changes' : 'Add memory'}
            loading={creating || updating}
            onPress={() => void handleSubmit((values) => save(values))()}
          />
        </View>
      </View>
    </FormFrame>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  // In the dialog the form shrinks to fit the card, and scrolls when the window is short.
  scrollDialog: { flexShrink: 1 },
  fields: { gap: space[5], paddingTop: space[2], paddingBottom: space[4] },
  group: { gap: space[4] },
  chips: { gap: space[2] },
  when: { flexDirection: 'row', gap: space[3] },
  whenField: { flex: 1 },
  mood: { gap: space[2] },
  moodChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  footer: {
    flexDirection: 'row',
    gap: space[3],
    paddingTop: space[3],
    paddingBottom: space[4],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  cancel: { flexShrink: 0 },
  save: { flex: 1 },
});
