import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';
import { formatTime } from '@/utils/format.util';

interface TimeFieldProps {
  label: string;
  /** The chosen moment (a timestamp); only its time of day is shown and changed. */
  value: number;
  /** Called with the picked hour (0-23) and minute. */
  onChange: (hours: number, minutes: number) => void;
  onBlur?: () => void;
}

/** Labelled time-of-day field in the TextField look. Opens the system time picker (inline on iOS). */
export const TimeField = ({ label, value, onChange, onBlur }: TimeFieldProps): ReactNode => {
  // Only iOS draws the picker inside the screen; Android opens a system dialog.
  const [inlineOpen, setInlineOpen] = useState(false);
  const current = new Date(value);

  const onPicked = (event: DateTimePickerEvent, date?: Date): void => {
    if (event.type === 'set' && date) onChange(date.getHours(), date.getMinutes());
    onBlur?.();
  };

  const open = (): void => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: current, mode: 'time', onChange: onPicked });
    } else {
      setInlineOpen((was) => !was);
    }
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="label">{label}</AppText>
      <Pressable
        onPress={open}
        style={[styles.field, { borderColor: inlineOpen ? colors.focus : colors.controlBorder }]}
      >
        <Icon name="calendar" size={18} color={colors.inkMuted} />
        <AppText variant="body">{formatTime(value)}</AppText>
      </Pressable>
      {Platform.OS === 'ios' && inlineOpen ? (
        <DateTimePicker
          value={current}
          mode="time"
          display="spinner"
          themeVariant="dark"
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
});
