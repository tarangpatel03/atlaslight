import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from './Screen';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';

/** Widest the dialog gets on tablets. */
const DIALOG_MAX_WIDTH = 560;

interface FormFrameProps {
  title: string;
  /** A centred dialog over the previous screen (wide windows) instead of a full screen (phones). */
  dialog: boolean;
  /** Space left and right of the content. */
  gutter: number;
  onClose: () => void;
  children: ReactNode;
  /** Drawn over the whole frame (confirm sheets), outside the dialog card so they can span the screen. */
  overlay?: ReactNode;
}

/** The shell around a form: header with back or close, and either the dialog card or the full screen. */
export const FormFrame = ({
  title,
  dialog,
  gutter,
  onClose,
  children,
  overlay,
}: FormFrameProps): ReactNode => {
  const insets = useSafeAreaInsets();
  // The dialog floats in the middle of the window, so the keyboard cannot shrink it from inside: the
  // space under the card grows by the keyboard's height instead, which lifts the card above the keys.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    if (!dialog) return undefined;
    const show = Keyboard.addListener('keyboardDidShow', (event) =>
      setKeyboardHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [dialog]);
  const body = (
    <KeyboardAvoidingView
      enabled={!dialog}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // On a full screen the safe-area padding sits between the window edge and this view, so the keyboard
      // is measured too low by that much; the dialog has no such padding.
      keyboardVerticalOffset={dialog ? 0 : insets.top + insets.bottom}
      style={dialog ? styles.dialogBody : styles.screenBody}
    >
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <Pressable onPress={onClose} style={styles.close}>
          <Icon name={dialog ? 'close' : 'chevronLeft'} />
        </Pressable>
        <AppText variant="title" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      </View>
      {children}
    </KeyboardAvoidingView>
  );

  if (dialog) {
    return (
      <View style={styles.root}>
        {/* Tapping the dimmed area closes the dialog. */}
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[styles.center, { paddingBottom: space[6] + keyboardHeight }]}
          pointerEvents="box-none"
        >
          <View style={styles.dialog}>{body}</View>
        </View>
        {overlay}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Screen padded={false}>{body}</Screen>
      {overlay}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  screenBody: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[6] },
  dialog: {
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    maxHeight: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  dialogBody: { flexShrink: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[3],
  },
  close: {
    width: sizes.touchMin,
    height: sizes.touchMin,
    marginLeft: -space[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
});
