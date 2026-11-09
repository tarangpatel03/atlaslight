import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  useCreateJourneyMutation,
  useDeleteJourneyMutation,
  useGetJourneyMediaQuery,
  useGetJourneysQuery,
  useUpdateJourneyMutation,
  type JourneyDetail,
  type JourneyListItem,
} from '@/api/journeys.api';
import { AppButton } from '@/components/buttons';
import { DateField, TextField } from '@/components/inputs';
import { FormFrame } from '@/components/layout';
import { ConfirmSheet, type AppBottomSheetRef } from '@/components/surfaces';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';
import { formatDate } from '@/utils/format.util';
import { formatDeletionSummary, noonOf, pickOngoing, toJourneyInput } from '@/utils/journey.util';
import { showToast } from '@/utils/toast.util';
import { journeySchema, type JourneyFormValues } from '@/utils/validation.util';
import { CoverPicker } from './CoverPicker';
import { SwitchRow } from './SwitchRow';

interface JourneyFormProps {
  /** The journey being edited; null starts a new one. */
  journey: JourneyDetail | null;
  dialog: boolean;
  gutter: number;
  onClose: () => void;
  /** Called with true when a delete starts (and false if it fails), so the screen stops reloading the journey. */
  onDeleting: (deleting: boolean) => void;
}

/** A save held back until the user agrees to end the journey that is still ongoing. */
type PendingSave = { values: JourneyFormValues; ongoing: JourneyListItem };

const messageOf = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'message' in error
    ? String(error.message)
    : undefined;

/** Form to start a journey or edit one (cover, favourite, delete). Errors show when a field loses focus. */
export const JourneyForm = ({
  journey,
  dialog,
  gutter,
  onClose,
  onDeleting,
}: JourneyFormProps): ReactNode => {
  const isEdit = journey !== null;
  const { data: journeys } = useGetJourneysQuery();
  const { data: mediaItems } = useGetJourneyMediaQuery(journey?.id ?? '', { skip: !isEdit });
  const [createJourney, { isLoading: creating }] = useCreateJourneyMutation();
  const [updateJourney, { isLoading: updating }] = useUpdateJourneyMutation();
  const [deleteJourney, { isLoading: deleting }] = useDeleteJourneyMutation();

  // New journeys start today; read once so rendering stays pure.
  const [today] = useState(() => noonOf(Date.now()));
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<JourneyFormValues>({
    resolver: zodResolver(journeySchema),
    mode: 'onBlur',
    defaultValues: {
      title: journey?.title ?? '',
      description: journey?.description ?? '',
      startDate: journey?.startDate ?? today,
      endDate: journey ? journey.endDate : null,
    },
  });
  const [isFavorite, setIsFavorite] = useState(journey?.isFavorite ?? false);
  const [coverMediaId, setCoverMediaId] = useState(journey?.coverMediaId ?? null);
  const [pending, setPending] = useState<PendingSave | null>(null);

  const conflictSheet = useRef<AppBottomSheetRef>(null);
  const deleteSheet = useRef<AppBottomSheetRef>(null);

  const startDate = useWatch({ control, name: 'startDate' });
  const endDate = useWatch({ control, name: 'endDate' });
  const ongoing = endDate === null;

  const save = async (values: JourneyFormValues, endCurrentOngoing: boolean): Promise<void> => {
    const input = toJourneyInput(values);
    try {
      if (journey) {
        await updateJourney({
          id: journey.id,
          ...input,
          isFavorite,
          coverMediaId,
          endCurrentOngoing,
        }).unwrap();
        showToast.success('Changes saved');
      } else {
        await createJourney({ ...input, endCurrentOngoing }).unwrap();
        showToast.success('Journey started');
      }
      onClose();
    } catch (e) {
      showToast.error("Couldn't save the journey", messageOf(e));
    }
  };

  const onValid = (values: JourneyFormValues): void => {
    // Only one journey can be ongoing: ask before ending the other one.
    const others = (journeys ?? []).filter((other) => other.id !== journey?.id);
    const ongoingOther = values.endDate === null ? pickOngoing(others) : null;
    if (ongoingOther) {
      setPending({ values, ongoing: ongoingOther });
      conflictSheet.current?.snapToIndex(0);
      return;
    }
    void save(values, false);
  };

  const confirmConflict = (): void => {
    const held = pending;
    conflictSheet.current?.close();
    if (held) void save(held.values, true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!journey) return;
    // The delete refreshes the journey's tags; without this the screen would try to reload a deleted journey.
    onDeleting(true);
    try {
      await deleteJourney(journey.id).unwrap();
      deleteSheet.current?.close();
      showToast.success('Journey deleted');
      onClose();
    } catch (e) {
      onDeleting(false);
      showToast.error("Couldn't delete the journey", messageOf(e));
    }
  };

  const overlay = (
    <>
      <ConfirmSheet
        ref={conflictSheet}
        title={pending ? `End ${pending.ongoing.title}?` : 'End the ongoing journey?'}
        message={
          pending
            ? `Only one journey can be ongoing. ${pending.ongoing.title} will end on ${formatDate(pending.values.startDate)}.`
            : ''
        }
        confirmLabel="End it and continue"
        onConfirm={confirmConflict}
        onCancel={() => {
          conflictSheet.current?.close();
          setPending(null);
        }}
      />
      {journey ? (
        <ConfirmSheet
          ref={deleteSheet}
          title={`Delete ${journey.title}?`}
          message={formatDeletionSummary(journey)}
          confirmLabel="Delete journey"
          destructive
          loading={deleting}
          onConfirm={() => void confirmDelete()}
          onCancel={() => deleteSheet.current?.close()}
        />
      ) : null}
    </>
  );

  return (
    <FormFrame
      title={isEdit ? 'Edit journey' : 'New journey'}
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
        <View style={[styles.group, { paddingHorizontal: gutter }]}>
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Name"
                placeholder="Spiti Valley"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  // Once an error is showing, clear it as soon as the name is fixed instead of waiting for blur.
                  if (errors.title) void trigger('title');
                }}
                onBlur={onBlur}
                error={errors.title?.message}
                maxLength={60}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Description (optional)"
                placeholder="What is this trip about?"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
              />
            )}
          />
          <Controller
            control={control}
            name="startDate"
            render={({ field: { value, onChange, onBlur } }) => (
              <DateField
                label="Starts"
                value={value}
                onChange={(next) => {
                  onChange(next);
                  // A later start can put the end date out of order.
                  if (endDate !== null) void trigger('endDate');
                }}
                onBlur={onBlur}
                error={errors.startDate?.message}
              />
            )}
          />
          <SwitchRow
            label="Ongoing journey"
            caption={ongoing ? 'No end date yet' : 'Ends on the day below'}
            value={ongoing}
            onValueChange={(next) =>
              setValue('endDate', next ? null : startDate, { shouldValidate: true })
            }
          />
          {ongoing ? null : (
            <Controller
              control={control}
              name="endDate"
              render={({ field: { value, onChange, onBlur } }) => (
                <DateField
                  label="Ends"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  minimumDate={startDate}
                  error={errors.endDate?.message}
                />
              )}
            />
          )}
        </View>

        {isEdit ? (
          <>
            <CoverPicker
              items={mediaItems ?? []}
              selectedId={coverMediaId}
              onSelect={setCoverMediaId}
              gutter={gutter}
            />
            <View style={[styles.group, { paddingHorizontal: gutter }]}>
              <SwitchRow
                label="Favourite"
                caption="Shown with a heart in your list"
                value={isFavorite}
                onValueChange={setIsFavorite}
              />
              <AppButton
                label="Delete journey"
                variant="danger"
                onPress={() => deleteSheet.current?.snapToIndex(0)}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: gutter }]}>
        {dialog ? (
          <View style={styles.cancel}>
            <AppButton label="Cancel" variant="ghost" onPress={onClose} />
          </View>
        ) : null}
        <View style={styles.save}>
          <AppButton
            label={isEdit ? 'Save changes' : 'Start journey'}
            loading={creating || updating}
            onPress={() => void handleSubmit(onValid)()}
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
