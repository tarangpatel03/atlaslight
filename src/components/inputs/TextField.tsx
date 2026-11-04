import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { AppText } from '@/components/brand/AppText';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';
import { typography } from '@/theme/typography';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Validation message; also switches the border to the error style. */
  error?: string;
}

/** Labelled text input with focus and error states. */
export const TextField = ({
  label,
  error,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps): ReactNode => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        placeholderTextColor={colors.inkMuted}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, focused && styles.focused, error ? styles.errorBorder : undefined]}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  input: {
    ...typography.body,
    minHeight: sizes.touchMin,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: space[4],
  },
  focused: { borderColor: colors.amber },
  errorBorder: { borderColor: colors.danger, borderWidth: 2 },
});
