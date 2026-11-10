import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSearchPlacesQuery } from '@/api/places.api';
import { AppText, Icon } from '@/components/brand';
import { AppButton } from '@/components/buttons';
import { TextField } from '@/components/inputs';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { colors } from '@/theme/colors';
import { radius, sizes, space } from '@/theme/layout';
import type { PlaceSuggestion } from '@/utils/photon.util';

/** Photon fair use: wait for the user to stop typing before searching. */
const SEARCH_DELAY_MS = 400;
const MIN_QUERY_LENGTH = 3;

interface PlaceFieldProps {
  /** Name (or coordinates) of the chosen place; null when none is chosen yet. */
  selectedLabel: string | null;
  /** Validation message, shown under the field. */
  error?: string;
  /** Called with the search result the user tapped. */
  onSelect: (place: PlaceSuggestion) => Promise<void>;
  /** Uses where the phone is now; resolves when the fix (or its failure) is handled. */
  onUseLocation: () => Promise<void>;
  /** Opens the full screen map to choose the spot. */
  onPickOnMap: () => void;
}

const subtitleOf = (place: PlaceSuggestion): string =>
  [place.locality, place.adminArea, place.countryName]
    .filter((part): part is string => part !== null && part !== place.name)
    .join(', ');

/** The memory's place: shows the chosen one, or a search box with Photon results to pick from. */
export const PlaceField = ({
  selectedLabel,
  error,
  onSelect,
  onUseLocation,
  onPickOnMap,
}: PlaceFieldProps): ReactNode => {
  const [changing, setChanging] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const query = useDebouncedValue(text.trim(), SEARCH_DELAY_MS);
  const searching = query.length >= MIN_QUERY_LENGTH;
  const { data, isFetching, isError } = useSearchPlacesQuery(query, { skip: !searching });

  const pick = async (place: PlaceSuggestion): Promise<void> => {
    setSaving(true);
    try {
      await onSelect(place);
      setChanging(false);
      setText('');
    } finally {
      setSaving(false);
    }
  };

  const findMe = async (): Promise<void> => {
    setLocating(true);
    try {
      await onUseLocation();
      setChanging(false);
      setText('');
    } finally {
      setLocating(false);
    }
  };

  const shortcuts = (
    <View style={styles.shortcuts}>
      <View style={styles.shortcut}>
        <AppButton
          label="My location"
          variant="secondary"
          icon="locate"
          loading={locating}
          disabled={saving}
          onPress={() => void findMe()}
        />
      </View>
      <View style={styles.shortcut}>
        <AppButton
          label="Pick on map"
          variant="secondary"
          icon="map"
          disabled={saving || locating}
          onPress={onPickOnMap}
        />
      </View>
    </View>
  );

  if (selectedLabel !== null && !changing) {
    return (
      <View style={styles.wrap}>
        <AppText variant="label">Place</AppText>
        <View style={styles.chosen}>
          <Icon name="mapPin" size={18} color={colors.amber} />
          <AppText variant="body" numberOfLines={1} style={styles.chosenText}>
            {selectedLabel}
          </AppText>
          <Pressable onPress={() => setChanging(true)} hitSlop={space[2]}>
            <AppText variant="label" color={colors.amber}>
              Change
            </AppText>
          </Pressable>
        </View>
        {shortcuts}
      </View>
    );
  }

  const results = data ?? [];
  return (
    <View style={styles.wrap}>
      <TextField
        label="Place"
        placeholder="Search for a place"
        icon="search"
        value={text}
        onChangeText={setText}
        error={error}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {shortcuts}
      {changing ? (
        <Pressable onPress={() => setChanging(false)} hitSlop={space[2]}>
          <AppText variant="label" color={colors.inkMuted}>
            Keep {selectedLabel}
          </AppText>
        </Pressable>
      ) : null}
      {searching && (isFetching || saving) ? (
        <ActivityIndicator color={colors.amber} style={styles.loading} />
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
              <Icon name="mapPin" size={18} color={colors.inkMuted} />
              <View style={styles.resultText}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {place.name}
                </AppText>
                {subtitleOf(place) ? (
                  <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
                    {subtitleOf(place)}
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
  // Same look as a TextField so the form reads as one set of fields.
  chosen: {
    minHeight: sizes.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.controlBorder,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: space[4],
  },
  chosenText: { flex: 1 },
  shortcuts: { flexDirection: 'row', gap: space[2] },
  shortcut: { flex: 1 },
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
