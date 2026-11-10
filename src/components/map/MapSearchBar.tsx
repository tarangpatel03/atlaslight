import type { ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Icon } from '@/components/brand';
import { colors } from '@/theme/colors';
import { radius, shadows, sizes, space } from '@/theme/layout';
import { typography } from '@/theme/typography';

interface MapSearchBarProps {
  text: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

/** Glass search pill floating over the map. */
export const MapSearchBar = ({ text, onChangeText, onClear }: MapSearchBarProps): ReactNode => (
  <View style={styles.bar}>
    <Icon name="search" size={18} color={colors.inkMuted} />
    <TextInput
      value={text}
      onChangeText={onChangeText}
      allowFontScaling={false}
      placeholder="Search memories and places"
      placeholderTextColor={colors.inkSubtle}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      style={styles.input}
    />
    {text ? (
      <Pressable onPress={onClear} hitSlop={space[2]}>
        <Icon name="close" size={18} color={colors.inkMuted} />
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  bar: {
    height: sizes.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.glassFallback,
    ...shadows.float,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.ink,
    paddingVertical: 0,
  },
});
