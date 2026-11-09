import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';
import { formatDate } from '@/utils/format.util';
import { noonOf } from '@/utils/journey.util';

interface DateFieldProps {
  label: string;
  /** The chosen day (a timestamp), or null when none is chosen yet. */
  value: number | null;
  /** Called with the picked day at local noon. */
  onChange: (value: number) => void;
  /** Called when the picker closes, so a form can validate on blur like for text fields. */
  onBlur?: () => void;
  /** Validation message; switches the border to the error style and adds an icon. */
  error?: string;
  /** Earliest day the picker allows. */
  minimumDate?: number;
}

/** Labelled day field in the TextField look. Opens the system date picker (inline on iOS). */
export const DateField = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  minimumDate,
}: DateFieldProps): ReactNode => {
  // Only iOS draws the picker inside the screen; Android opens a system dialog.
  const [inlineOpen, setInlineOpen] = useState(false);
  // The day the picker starts on when no day is chosen yet; read once so rendering stays pure.
  const [fallbackDay] = useState(() => Date.now());
  const current = new Date(value ?? fallbackDay);
  const min = minimumDate === undefined ? undefined : new Date(minimumDate);

  const onPicked = (event: DateTimePickerEvent, date?: Date): void => {
    if (event.type === 'set' && date) onChange(noonOf(date.getTime()));
    onBlur?.();
  };

  const open = (): void => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        minimumDate: min,
        onChange: onPicked,
      });
    } else {
      setInlineOpen((was) => !was);
    }
  };

  const borderColor = error ? colors.danger : inlineOpen ? colors.focus : colors.controlBorder;

  return (
    <View style={styles.wrap}>
      <AppText variant="label">{label}</AppText>
      <Pressable onPress={open} style={[styles.field, { borderColor }]}>
        <Icon name="calendar" size={18} color={colors.inkMuted} />
        <AppText variant="body" color={value === null ? colors.inkSubtle : colors.ink}>
          {value === null ? 'Pick a day' : formatDate(value)}
        </AppText>
      </Pressable>
      {error ? (
        <View style={styles.message}>
          <Icon name="alert" size={18} color={colors.danger} />
          <AppText variant="caption" color={colors.danger} style={styles.messageText}>
            {error}
          </AppText>
        </View>
      ) : null}
      {Platform.OS === 'ios' && inlineOpen ? (
        <DateTimePicker
          value={current}
          mode="date"
          display="inline"
          themeVariant="dark"
          minimumDate={min}
          onChange={onPicked}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  // Same border width in every state, like TextField, so the field never shifts.
  field: {
    minHeight: sizes.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: space[4],
  },
  message: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  messageText: { flexShrink: 1 },
});
