import { useRef, useState, type ReactNode } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { AppText, ICONS, Icon, type IconName } from '@/components/brand';
import { AppButton, Fab, IconButton, type ButtonVariant } from '@/components/buttons';
import { landscapePhoto, portraitPhoto } from '@/assets/demo';
import { JourneyCard, MemoryCard } from '@/components/cards';
import { Chip, Switch, TextField } from '@/components/inputs';
import { Screen } from '@/components/layout';
import { MapPin } from '@/components/map';
import {
  AppBottomSheet,
  AuroraRing,
  Card,
  GlassPanel,
  StatTile,
  type AppBottomSheetRef,
} from '@/components/surfaces';
import { useWindowClass } from '@/hooks/useWindowClass';
import { formatDate, formatDateRange } from '@/utils/format.util';
import { colors } from '@/theme/colors';
import { typography, type TypographyToken } from '@/theme/typography';
import { styles } from './style';
import { KitSection } from './subcomponents';

const noop = (): void => undefined;

// MapPin takes a file URI; the demo photo stands in for a memory thumbnail.
const landscapeUri = Image.resolveAssetSource(landscapePhoto)?.uri;

// Local-time noon, so the demo dates read the same in any timezone.
const day = (year: number, monthIndex: number, date: number): number =>
  new Date(year, monthIndex, date, 12).getTime();

// Object.keys is typed string[]; the keys come from the const maps, so the casts are safe.
const typeTokens = Object.keys(typography) as TypographyToken[];
const colorTokens = Object.keys(colors) as (keyof typeof colors)[];
const buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const iconNames = Object.keys(ICONS) as IconName[];

/** Dev-only gallery of the UI kit. Each Phase 2 checkpoint adds its components here for screenshots. */
export const KitScreen = (): ReactNode => {
  const { bottomChrome } = useWindowClass();
  const [chipSelected, setChipSelected] = useState(false);
  const [wishSelected, setWishSelected] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState('');
  const mapSheet = useRef<AppBottomSheetRef>(null);
  const pickerSheet = useRef<AppBottomSheetRef>(null);

  return (
    <View style={styles.root}>
      <Screen>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomChrome }]}
          showsVerticalScrollIndicator={false}
        >
          <KitSection title="Typography">
            {typeTokens.map((token) => (
              <AppText key={token} variant={token}>
                {token}
              </AppText>
            ))}
          </KitSection>

          <KitSection title="Colors">
            <View style={styles.row}>
              {colorTokens.map((token) => (
                <View key={token} style={styles.swatch}>
                  <View style={[styles.swatchChip, { backgroundColor: colors[token] }]} />
                  <AppText variant="label" color={colors.inkMuted}>
                    {token}
                  </AppText>
                </View>
              ))}
            </View>
          </KitSection>

          <KitSection title="Icons 22">
            <View style={styles.row}>
              {iconNames.map((name) => (
                <View key={name} style={styles.iconCell}>
                  <Icon name={name} />
                </View>
              ))}
            </View>
          </KitSection>

          <KitSection title="Icons 18 (amber)">
            <View style={styles.row}>
              {iconNames.map((name) => (
                <View key={name} style={styles.iconCell}>
                  <Icon name={name} size={18} color={colors.amber} />
                </View>
              ))}
            </View>
          </KitSection>

          <KitSection title="Buttons">
            {buttonVariants.map((variant) => (
              <View key={variant} style={styles.row}>
                <AppButton label="Add memory" variant={variant} onPress={noop} />
                <AppButton label="Add memory" variant={variant} icon="plus" onPress={noop} />
                <AppButton label="Add memory" variant={variant} onPress={noop} disabled />
                <AppButton label="Add memory" variant={variant} onPress={noop} loading />
              </View>
            ))}
          </KitSection>

          <KitSection title="Text fields">
            <TextField
              label="Journey title"
              placeholder="Spiti Valley"
              value={title}
              onChangeText={setTitle}
            />
            <TextField
              label="Search places"
              icon="search"
              hint="Search runs on this device first."
              placeholder="Ladakh, Udaipur..."
              value={query}
              onChangeText={setQuery}
            />
            <TextField
              label="Journey title"
              error="Give your journey a name."
              placeholder="Spiti Valley"
              value=""
            />
            <TextField label="Start date" editable={false} value="12 Mar 2026" />
            <TextField
              label="Notes"
              multiline
              placeholder="What do you want to remember?"
              value={notes}
              onChangeText={setNotes}
            />
          </KitSection>

          <KitSection title="Chips">
            <View style={styles.row}>
              <Chip
                label="All journeys"
                onPress={() => setChipSelected((v) => !v)}
                selected={chipSelected}
              />
              <Chip label="Favourites" icon="check" selected onPress={noop} />
              <Chip
                label="Wishlist"
                variant="wish"
                onPress={() => setWishSelected((v) => !v)}
                selected={wishSelected}
              />
              <Chip label="Ongoing" variant="live" />
              <Chip label="Archived" disabled />
              <Chip label="Spiti Valley" icon="mapPin" />
            </View>
          </KitSection>

          <KitSection title="Switch">
            <View style={styles.row}>
              <Switch
                value={switchOn}
                onValueChange={setSwitchOn}
              />
              <Switch value={false} onValueChange={noop} />
              <Switch value onValueChange={noop} disabled />
              <Switch value={false} onValueChange={noop} disabled />
            </View>
          </KitSection>

          <KitSection title="Cards">
            <Card>
              <AppText variant="title">Monsoon in Udaipur</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                6 memories
              </AppText>
            </Card>
            <Card onPress={noop}>
              <AppText variant="title">Spiti Valley</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                12–15 Mar 2026
              </AppText>
            </Card>
          </KitSection>

          <KitSection title="Stat tiles">
            <View style={styles.row}>
              <StatTile value={12} label="Journeys" />
              <StatTile value={1240} unit="km" label="Distance" progress={0.62} />
              <StatTile value={3} label="Countries" />
              <StatTile value={148} label="Memories" progress={0.3} />
            </View>
          </KitSection>

          <KitSection title="Aurora rings">
            <View style={styles.row}>
              <AuroraRing progress={0.25} size={64} strokeWidth={6} />
              <AuroraRing progress={0.62} />
              <AuroraRing progress={1} size={128} strokeWidth={10}>
                <AppText variant="stat">100%</AppText>
              </AuroraRing>
            </View>
          </KitSection>

          <KitSection title="Glass panel (over the map)">
            <View style={styles.mapBlock}>
              <GlassPanel>
                <AppText variant="subheading">Fatehsagar Lake</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  13 March 2026 · 4 photos
                </AppText>
              </GlassPanel>
            </View>
          </KitSection>

          <KitSection title="Map controls">
            <View style={[styles.row, styles.mapBlock]}>
              <IconButton icon="search" onPress={noop} />
              <IconButton icon="route" onPress={noop} disabled />
              <Fab onPress={noop} />
            </View>
          </KitSection>

          <KitSection title="Map pins">
            <View style={[styles.row, styles.mapBlock]}>
              <MapPin variant="dot" />
              <MapPin variant="cluster" count={12} />
              <MapPin variant="photo" uri={landscapeUri} />
              <MapPin variant="photo" uri={landscapeUri} selected />
              <MapPin variant="wish" />
              <MapPin variant="live" />
            </View>
          </KitSection>

          <KitSection title="Journey cards">
            <JourneyCard
              layout="hero"
              title="Spiti Valley"
              dateRange={formatDateRange(day(2026, 2, 12), null)}
              memoryCount={6}
              cover={landscapePhoto}
              ongoing
              favorite
              onPress={noop}
            />
            <JourneyCard
              layout="hero"
              title="Monsoon in Udaipur, a long title that has to wrap onto two lines"
              dateRange={formatDateRange(day(2025, 6, 28), day(2025, 7, 3))}
              memoryCount={1}
              onPress={noop}
            />
            <JourneyCard
              layout="row"
              title="Goa off-season"
              dateRange={formatDateRange(day(2025, 10, 28), day(2025, 11, 2))}
              memoryCount={14}
              cover={portraitPhoto}
              favorite
              onPress={noop}
            />
            <JourneyCard
              layout="row"
              title="Kerala by train"
              dateRange={formatDateRange(day(2024, 0, 5), day(2024, 0, 12))}
              memoryCount={9}
              onPress={noop}
            />
            <JourneyCard
              layout="row"
              title="Rann Utsav weekend"
              dateRange={formatDateRange(day(2024, 11, 14), day(2024, 11, 14))}
              memoryCount={3}
              cover={portraitPhoto}
              selected
              onPress={noop}
            />
          </KitSection>

          <KitSection title="Memory cards">
            <View>
              <MemoryCard
                step={1}
                title="Fatehsagar Lake"
                place="Udaipur, Rajasthan"
                visitedLabel={formatDate(day(2026, 2, 13))}
                mediaCount={4}
                thumb={portraitPhoto}
                mood="Calm"
                onPress={noop}
              />
              <MemoryCard
                step={2}
                title="City Palace at sunrise, an early start"
                place="Udaipur, Rajasthan"
                visitedLabel={formatDate(day(2026, 2, 14))}
                mediaCount={1}
                onPress={noop}
              />
              <MemoryCard
                step={3}
                title="Kumbhalgarh"
                visitedLabel={formatDate(day(2026, 2, 15))}
                mediaCount={12}
                thumb={landscapePhoto}
                isLast
                onPress={noop}
              />
            </View>
          </KitSection>

          <KitSection title="Bottom sheet">
            <View style={styles.row}>
              <AppButton
                label="Open map sheet"
                variant="secondary"
                onPress={() => mapSheet.current?.snapToIndex(0)}
              />
              <AppButton
                label="Open picker"
                variant="secondary"
                onPress={() => pickerSheet.current?.snapToIndex(0)}
              />
            </View>
          </KitSection>
        </ScrollView>
      </Screen>

      {/* Siblings of Screen so the sheets span the full width, not the screen margins. */}
      <AppBottomSheet
        ref={mapSheet}
        snapPoints={['36%', '60%']}
        glass
      >
        <AppText variant="title">Fatehsagar Lake</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          13 March 2026 · 4 photos
        </AppText>
        <View style={styles.row}>
          <Chip label="Udaipur" icon="mapPin" />
          <Chip label="Monsoon" />
        </View>
        <AppButton label="Open memory" onPress={noop} />
      </AppBottomSheet>

      <AppBottomSheet
        ref={pickerSheet}
        snapPoints={['45%']}
        backdrop
      >
        <AppText variant="heading">New journey</AppText>
        <TextField label="Journey title" placeholder="Spiti Valley" />
        <View style={styles.row}>
          <Switch value={switchOn} onValueChange={setSwitchOn} />
          <AppText variant="body">Suggest trips from photos</AppText>
        </View>
      </AppBottomSheet>
    </View>
  );
};
