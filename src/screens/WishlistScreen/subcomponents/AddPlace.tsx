import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSearchPlacesQuery } from '@/api/places.api';
import { AppText, Icon } from '@/components/brand';
import { TextField } from '@/components/inputs';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';
import { placeSubtitle } from '@/utils/wishlist.util';
import type { PlaceSuggestion } from '@/utils/photon.util';

/** Photon fair use: wait for the user to stop typing before searching. */
const SEARCH_DELAY_MS = 400;
const MIN_QUERY_LENGTH = 3;

interface AddPlaceProps {
  /** Called with the result the user tapped; resolves when it is on the wishlist (or has failed). */
  onPick: (place: PlaceSuggestion) => Promise<void>;
}

/** Search box with Photon results; tapping a result adds that place to the wishlist. */
export const AddPlace = ({ onPick }: AddPlaceProps): ReactNode => {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const query = useDebouncedValue(text.trim(), SEARCH_DELAY_MS);
  const searching = query.length >= MIN_QUERY_LENGTH;
  const { data, isFetching, isError } = useSearchPlacesQuery(query, { skip: !searching });
  const results = searching ? (data ?? []) : [];

  const pick = async (place: PlaceSuggestion): Promise<void> => {
    setSaving(true);
    try {
      await onPick(place);
      setText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <TextField
        label="Add a place"
        placeholder="Search for a place"
        icon="search"
        value={text}
        onChangeText={setText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searching && (isFetching || saving) ? (
        <ActivityIndicator color={colors.auroraViolet} style={styles.loading} />
      ) : null}
      {searching && isError ? (
        <AppText variant="caption" color={colors.inkMuted}>
          Can't reach place search. Check your connection.
        </AppText>
      ) : null}
      {searching && !isFetching && !isError && results.length === 0 ? (
        <AppText variant="caption" color={colors.inkMuted}>
          No places found. Try another spelling.
        </AppText>
      ) : null}
      {results.length > 0 ? (
        <View style={styles.results}>
          {results.map((place) => (
            <Pressable
              key={`${place.latitude},${place.longitude},${place.name}`}
              onPress={() => void pick(place)}
              disabled={saving}
              style={styles.result}
            >
              <Icon name="plus" size={18} color={colors.violetInk} />
              <View style={styles.resultText}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {place.name}
                </AppText>
                {placeSubtitle(place) ? (
                  <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
                    {placeSubtitle(place)}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: space[2] },
  loading: { alignSelf: 'flex-start' },
  results: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  result: {
    minHeight: sizes.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
  },
  resultText: { flex: 1 },
});
