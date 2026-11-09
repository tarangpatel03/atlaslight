import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { AppText, Icon, type IconName } from '@/components/brand';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';
import { typography } from '@/theme/typography';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Validation message; also switches the border to the error style and adds an icon. */
  error?: string;
  /** Helper text under the field; replaced by `error` when there is one. */
  hint?: string;
  /** Optional leading icon. */
  icon?: IconName;
}

/** Labelled text input with focus, error and disabled states. Set `editable={false}` to disable. */
export const TextField = ({
  label,
  error,
  hint,
  icon,
  editable = true,
  multiline,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps): ReactNode => {
  const [focused, setFocused] = useState(false);
  const disabled = !editable;
  const message = error ?? hint;

  let borderColor: string = colors.controlBorder;
  if (disabled) borderColor = colors.hairline;
  else if (error) borderColor = colors.danger;
  else if (focused) borderColor = colors.focus;

  return (
    <View style={styles.wrap}>
      <AppText variant="label">{label}</AppText>
      <View style={[styles.field, multiline && styles.fieldMultiline, { borderColor }]}>
        {icon ? (
          <Icon
            name={icon}
            size={18}
            color={focused && !disabled ? colors.amber : colors.inkMuted}
          />
        ) : null}
        <TextInput
          {...rest}
          allowFontScaling={false}
          editable={editable}
          multiline={multiline}
          placeholderTextColor={colors.inkSubtle}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, disabled && styles.inputDisabled]}
        />
      </View>
      {message ? (
        <View style={styles.message}>
          {error ? <Icon name="alert" size={18} color={colors.danger} /> : null}
          <AppText
            variant="caption"
            color={error ? colors.danger : colors.inkMuted}
            style={styles.messageText}
          >
            {message}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  // Border width is the same in every state so the field never shifts when it changes.
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
  fieldMultiline: { alignItems: 'flex-start', paddingTop: space[3] },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.ink,
    paddingVertical: 0,
  },
  inputDisabled: { color: colors.inkSubtle },
  message: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  messageText: { flexShrink: 1 },
});
