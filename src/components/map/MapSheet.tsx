import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { MapStopItem } from '@/api/map.api';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { Cover } from '@/components/cards';
import { AppBottomSheet, type AppBottomSheetRef } from '@/components/surfaces';
import { mediaUri } from '@/services/mediaStorage.service';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { formatDate } from '@/utils/format.util';

interface MapSheetProps {
  /** The selected memory; the sheet opens for it and closes when this goes back to null. */
  stop: MapStopItem | null;
  /** Space kept free under the sheet (the floating tab bar). */
  bottomInset: number;
  onClose: () => void;
  onOpenMemory: (stopId: string) => void;
}

const COVER_SIZE = 72;

/** Glass bottom sheet with the selected memory over the map. */
export const MapSheet = ({
  stop,
  bottomInset,
  onClose,
  onOpenMemory,
}: MapSheetProps): ReactNode => {
  const sheetRef = useRef<AppBottomSheetRef>(null);
  // Keeps showing the last memory while the sheet slides away, instead of an empty sheet.
  const [shown, setShown] = useState(stop);
  if (stop && stop !== shown) setShown(stop);

  useEffect(() => {
    if (stop) sheetRef.current?.snapToIndex(0);
    else sheetRef.current?.close();
  }, [stop]);

  return (
    <AppBottomSheet
      ref={sheetRef}
      glass
      // Mounted with a memory already selected (the window class changed): start open.
      index={stop ? 0 : -1}
      snapPoints={['34%', '60%']}
      bottomInset={bottomInset}
      onClose={onClose}
    >
      {shown ? (
        <>
          <View style={styles.head}>
            <Cover source={{ uri: mediaUri(shown.coverThumbnailPath) }} style={styles.cover} />
            <View style={styles.text}>
              <AppText variant="title" numberOfLines={2}>
                {shown.title}
              </AppText>
              <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
                {shown.journeyTitle} · {formatDate(shown.visitedAt)}
              </AppText>
            </View>
          </View>
          <AppButton label="Open memory" onPress={() => onOpenMemory(shown.id)} />
        </>
      ) : null}
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  head: { flexDirection: 'row', gap: space[3], alignItems: 'center' },
  cover: { width: COVER_SIZE, height: COVER_SIZE, borderRadius: radius.lg },
  text: { flex: 1, gap: space[1] },
});
