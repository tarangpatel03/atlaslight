import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { Cover } from '@/components/cards';
import { findLocatedPhotos, requestPhotoAccess } from '@/services/photoLibrary.service';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';
import { formatCount, formatShortDateTime } from '@/utils/format.util';
import { groupPhotosByPlace, type PhotoSuggestion } from '@/utils/photoSuggestion.util';
import { showToast } from '@/utils/toast.util';

const CARD_WIDTH = 168;
const COVER_HEIGHT = 96;

type Status = 'idle' | 'loading' | 'denied' | 'done';

interface FoundInPhotosProps {
  /** The days to look in (ms), usually the journey's days; null while the journey is unknown. */
  window: { from: number; to: number } | null;
  /** Called with the suggestion the user tapped; the form fills in place and time. */
  onUse: (suggestion: PhotoSuggestion) => Promise<void>;
  /** Space left and right the strip scrolls through, so it can run to the edge of the form. */
  gutter: number;
}

/** Places found in the photos of the journey's days; one tap fills the memory's place and time. */
export const FoundInPhotos = ({ window, onUse, gutter }: FoundInPhotosProps): ReactNode => {
  const [status, setStatus] = useState<Status>('idle');
  const [suggestions, setSuggestions] = useState<PhotoSuggestion[]>([]);
  const [usingId, setUsingId] = useState<string | null>(null);

  const look = async (): Promise<void> => {
    if (!window) return;
    setStatus('loading');
    try {
      if ((await requestPhotoAccess()) === 'denied') {
        setStatus('denied');
        return;
      }
      setSuggestions(groupPhotosByPlace(await findLocatedPhotos(window.from, window.to)));
      setStatus('done');
    } catch (e) {
      showToast.error("Couldn't read your photos", e instanceof Error ? e.message : undefined);
      setStatus('idle');
    }
  };

  const use = async (suggestion: PhotoSuggestion): Promise<void> => {
    setUsingId(suggestion.id);
    try {
      await onUse(suggestion);
    } finally {
      setUsingId(null);
    }
  };

  return (
    <View style={[styles.card, { marginHorizontal: gutter }]}>
      <View style={styles.header}>
        <Icon name="image" size={18} color={colors.amber} />
        <AppText variant="bodyStrong">Found in your photos</AppText>
      </View>

      {status === 'idle' ? (
        <>
          <AppText variant="caption" color={colors.inkMuted}>
            Find places from the days of this journey.
          </AppText>
          <View style={styles.action}>
            <AppButton label="Look in my photos" variant="secondary" onPress={() => void look()} />
          </View>
        </>
      ) : null}

      {status === 'loading' ? (
        <ActivityIndicator color={colors.amber} style={styles.loading} />
      ) : null}

      {status === 'denied' ? (
        <>
          <AppText variant="caption" color={colors.inkMuted}>
            Allow photo access to see places from your photos.
          </AppText>
          <View style={styles.actions}>
            <AppButton
              label="Open settings"
              variant="secondary"
              onPress={() => void Linking.openSettings()}
            />
            <AppButton label="Try again" variant="ghost" onPress={() => void look()} />
          </View>
        </>
      ) : null}

      {status === 'done' && suggestions.length === 0 ? (
        <AppText variant="caption" color={colors.inkMuted}>
          No photos with a location from these days. Search for a place instead.
        </AppText>
      ) : null}

      {status === 'done' && suggestions.length > 0 ? (
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.strip}
        >
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion.id}
              disabled={usingId !== null}
              onPress={() => void use(suggestion)}
              style={[styles.suggestion, usingId === suggestion.id && styles.using]}
            >
              <Cover source={{ uri: suggestion.coverUri }} style={styles.cover} />
              <View style={styles.suggestionText}>
                <AppText variant="caption">{formatShortDateTime(suggestion.takenAt)}</AppText>
                <AppText variant="coord" color={colors.inkMuted}>
                  {formatCount(suggestion.photoCount, 'photo', 'photos')} · Use
                </AppText>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  action: { alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  loading: { alignSelf: 'flex-start' },
  strip: { gap: space[2] },
  suggestion: {
    width: CARD_WIDTH,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.controlBorder,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  using: { borderColor: colors.amber },
  cover: { width: '100%', height: COVER_HEIGHT },
  suggestionText: { gap: space[1], padding: space[2] },
});
