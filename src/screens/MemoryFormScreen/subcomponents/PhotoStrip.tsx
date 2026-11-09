import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText, Icon, type IconName } from '@/components/brand';
import { Cover } from '@/components/cards';
import { mediaUri } from '@/services/mediaStorage.service';
import type { PickedMedia } from '@/services/picker.service';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/layout';

const TILE = 88;

/** A photo or video already saved with the memory. */
export type StoredTile = { id: string; thumbnailPath: string | null; isVideo: boolean };

interface PhotoStripProps {
  /** Media already saved (edit), minus the ones marked for removal. */
  stored: StoredTile[];
  /** Newly picked media that are saved with the form. */
  picked: PickedMedia[];
  /** Space left and right the strip scrolls through, so it can run to the edge of the form. */
  gutter: number;
  /** Disables the add buttons while the picker or a save is running. */
  busy: boolean;
  onLibrary: () => void;
  onCamera: () => void;
  onRemoveStored: (id: string) => void;
  onRemovePicked: (path: string) => void;
}

interface AddTileProps {
  icon: IconName;
  label: string;
  disabled: boolean;
  onPress: () => void;
}

const AddTile = ({ icon, label, disabled, onPress }: AddTileProps): ReactNode => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    style={[styles.tile, styles.add, disabled && styles.disabled]}
  >
    <Icon name={icon} color={colors.amber} />
    <AppText variant="label" color={colors.inkMuted}>
      {label}
    </AppText>
  </Pressable>
);

interface MediaTileProps {
  uri: string | undefined;
  isVideo: boolean;
  isCover: boolean;
  onRemove: () => void;
}

const MediaTile = ({ uri, isVideo, isCover, onRemove }: MediaTileProps): ReactNode => (
  <View style={styles.tile}>
    <Cover source={uri ? { uri } : undefined} style={styles.cover} />
    {isVideo ? (
      <View style={styles.videoBadge}>
        <Icon name="video" size={18} />
      </View>
    ) : null}
    {isCover ? (
      <View style={styles.coverBadge}>
        <AppText variant="label">Cover</AppText>
      </View>
    ) : null}
    <Pressable onPress={onRemove} style={styles.remove} hitSlop={space[2]}>
      <Icon name="close" size={18} />
    </Pressable>
  </View>
);

/** Photo strip of a memory: add buttons first, then its media. The first one is the cover. */
export const PhotoStrip = ({
  stored,
  picked,
  gutter,
  busy,
  onLibrary,
  onCamera,
  onRemoveStored,
  onRemovePicked,
}: PhotoStripProps): ReactNode => (
  <View style={styles.wrap}>
    <AppText variant="label" style={{ paddingHorizontal: gutter }}>
      Photos and videos
    </AppText>
    <ScrollView
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.strip, { paddingHorizontal: gutter }]}
    >
      <AddTile icon="image" label="Library" disabled={busy} onPress={onLibrary} />
      <AddTile icon="camera" label="Camera" disabled={busy} onPress={onCamera} />
      {stored.map((item, index) => (
        <MediaTile
          key={item.id}
          uri={mediaUri(item.thumbnailPath)}
          isVideo={item.isVideo}
          isCover={index === 0}
          onRemove={() => onRemoveStored(item.id)}
        />
      ))}
      {picked.map((item, index) => (
        <MediaTile
          key={item.path}
          // Picked photos show themselves (the picker already shrank them); videos have no frame yet.
          uri={item.type === 'photo' ? `file://${item.path.replace(/^file:\/\//, '')}` : undefined}
          isVideo={item.type === 'video'}
          isCover={stored.length === 0 && index === 0}
          onRemove={() => onRemovePicked(item.path)}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: space[2] },
  strip: { gap: space[2] },
  tile: { width: TILE, height: TILE, borderRadius: radius.md, overflow: 'hidden' },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    borderWidth: 1.5,
    borderColor: colors.controlBorder,
    backgroundColor: colors.surfaceRaised,
  },
  disabled: { opacity: 0.5 },
  cover: { width: '100%', height: '100%' },
  videoBadge: {
    position: 'absolute',
    left: space[1],
    bottom: space[1],
    padding: space[1],
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
  coverBadge: {
    position: 'absolute',
    left: space[1],
    top: space[1],
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
  remove: {
    position: 'absolute',
    right: space[1],
    bottom: space[1],
    padding: space[1],
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
});
