import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  useBottomSheetSpringConfigs,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { radius, shadows, space } from '@/theme/layout';
import { springs } from '@/theme/motion';

/** Methods of the sheet (`snapToIndex`, `close`, ...) for use with a ref. */
export type AppBottomSheetRef = ComponentRef<typeof BottomSheet>;

interface AppBottomSheetProps {
  children: ReactNode;
  ref?: Ref<AppBottomSheetRef>;
  /** Heights the sheet rests at, e.g. `['28%', '60%']`. */
  snapPoints: (string | number)[];
  /** Starting snap point; -1 (default) keeps the sheet closed. */
  index?: number;
  /** Glass look for sheets over the map only; other sheets use the solid surface. */
  glass?: boolean;
  /** Dims what is behind and closes the sheet when tapped. */
  backdrop?: boolean;
  onClose?: () => void;
  /** Space kept free under the sheet, e.g. for the floating tab bar. */
  bottomInset?: number;
}

const HANDLE_WIDTH = 40;
const HANDLE_HEIGHT = 4;

const renderBackdrop = (props: BottomSheetBackdropProps): ReactNode => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={1}
    style={[props.style, styles.backdrop]}
  />
);

/** Themed bottom sheet over its parent container. Closed by default; swipe down to close. */
export const AppBottomSheet = ({
  children,
  ref,
  snapPoints,
  index = -1,
  glass = false,
  backdrop = false,
  onClose,
  bottomInset,
}: AppBottomSheetProps): ReactNode => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // The library's backdrop starts touchable and only turns "none" once the sheet moves (a mount race in
  // its own effect), so a closed sheet's backdrop would block the whole screen. Mount it only while open.
  const [opened, setOpened] = useState(index >= 0);
  const springConfigs = useBottomSheetSpringConfigs(springs.gentle);

  return (
    <BottomSheet
      // A closed sheet keeps its old closed position when the window size changes (rotation, fold, split
      // screen) and peeks out empty; a fresh sheet starts open or closed correctly.
      key={`${width}x${height}`}
      ref={ref}
      index={index}
      snapPoints={snapPoints}
      bottomInset={bottomInset}
      enableDynamicSizing={false}
      enablePanDownToClose
      animationConfigs={springConfigs}
      backdropComponent={backdrop && opened ? renderBackdrop : undefined}
      onAnimate={(_from, to) => {
        if (to >= 0) setOpened(true);
      }}
      backgroundStyle={glass ? styles.glass : styles.solid}
      handleIndicatorStyle={styles.handle}
      onClose={() => {
        setOpened(false);
        onClose?.();
      }}
    >
      <BottomSheetView style={[styles.content, { paddingBottom: space[4] + insets.bottom }]}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  solid: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  glass: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.glassFallback,
    ...shadows.float,
  },
  handle: {
    width: HANDLE_WIDTH,
    height: HANDLE_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.controlBorder,
  },
  content: { paddingHorizontal: space[4], gap: space[3] },
  // `opacity={1}` on the backdrop keeps the library's fade; the colour carries the dimming.
  backdrop: { backgroundColor: colors.scrim },
});
