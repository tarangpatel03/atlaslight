import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { MapStopItem } from '@/api/map.api';
import { AppText } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { Cover } from '@/components/cards';
import { mediaUri } from '@/services/mediaStorage.service';
import { colors } from '@/theme/colors';
import { sizes, space } from '@/theme/layout';
import { formatDate } from '@/utils/format.util';
import { formatCoordinates } from '@/utils/memory.util';

const COVER_HEIGHT = 230;

interface MapPanelProps {
  /** The selected memory; the panel slides in for it and out when this goes back to null. */
  stop: MapStopItem | null;
  /** 0 = hidden past the right edge, 1 = fully open. The screen drives it so other controls can move with the panel. */
  progress: SharedValue<number>;
  onOpenMemory: (stopId: string) => void;
  onOpenJourney: (journeyId: string) => void;
}

/** Tablet side panel over the map's right edge: the selected memory and the way into it and its journey. */
export const MapPanel = ({
  stop,
  progress,
  onOpenMemory,
  onOpenJourney,
}: MapPanelProps): ReactNode => {
  // Keeps showing the last memory while the panel slides away, instead of an empty panel.
  const [shown, setShown] = useState(stop);
  if (stop && stop !== shown) setShown(stop);

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.get()) * sizes.panelWidth }],
  }));

  if (!shown) return null;
  const cover = mediaUri(shown.coverThumbnailPath);

  return (
    <Animated.View style={[styles.panel, slide]} pointerEvents={stop ? 'auto' : 'none'}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Cover
            source={cover ? { uri: cover } : undefined}
            scrim
            scrimColor={colors.surface}
            style={styles.cover}
          />
          <View style={styles.coverText} pointerEvents="none">
            <AppText variant="overline" color={colors.inkMuted} numberOfLines={1}>
              {shown.journeyTitle} · {formatDate(shown.visitedAt)}
            </AppText>
            <AppText variant="title" numberOfLines={2}>
              {shown.title}
            </AppText>
          </View>
        </View>
        <View style={styles.details}>
          <AppText variant="coord" color={colors.inkSubtle}>
            {formatCoordinates(shown.latitude, shown.longitude)}
          </AppText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton label="Open memory" onPress={() => onOpenMemory(shown.id)} />
        <AppButton
          label="Open journey"
          variant="secondary"
          onPress={() => onOpenJourney(shown.journeyId)}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: sizes.panelWidth,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.hairline,
  },
  cover: { width: '100%', height: COVER_HEIGHT },
  coverText: {
    position: 'absolute',
    left: space[6],
    right: space[6],
    bottom: space[3],
    gap: space[1],
  },
  details: { paddingHorizontal: space[6], paddingTop: space[3] },
  footer: {
    gap: space[3],
    padding: space[6],
    paddingTop: space[4],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});
