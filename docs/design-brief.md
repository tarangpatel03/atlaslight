# Design brief — Atlaslight

Approved. Claude reads this before any UI work. It overrides style defaults from skills and plugins
(see "Deliberate exceptions" below). Tokens live in `src/theme/`; use them, never raw values.

Reference designs (approved, private links for the owner):

- Design system: https://claude.ai/artifact/9xz659Pg9mPf2RtQpBdvd6
- Phone + tablet screens: https://claude.ai/artifact/8s5PvjYqnmhmumthksxS38

If a screen here and the reference designs disagree, ask.

## Product

- What it is: an offline travel journal where journeys and memories become amber pins and aurora
  routes on one dark world map.
- Who uses it: one traveller, on a phone during and after trips (one hand, outdoors, often at night),
  and on a tablet at home to browse and relive trips.
- Platforms: [x] Android [ ] iOS (compiles, not tested) [x] Tablet / foldable

## Direction

- Mood words: **warm, nocturnal, calm** — a journal opened at night (Midnight Atlas) lit by
  aurora light for movement and numbers.
- Two ideas, never swapped:
  - **Amber = memory.** Anything the user lived: memory pins, visited regions, the primary action,
    the active tab.
  - **Aurora (teal → violet) = motion and measurement.** Route lines, stat rings and progress bars,
    the live-location pulse, the "Ongoing" chip outline. Nothing else.
- Photos and the map lead. Chrome is dark, flat and quiet.
- Must NOT look like: a generic purple-gradient AI app, Google Maps' default dark mode, or a stock
  social feed.
- Dark only. No light theme. (Shareable recap cards, later, may use their own light layout.)

## Color (`src/theme/colors.ts`)

- Grounds, stacked upward: `bg` #0a0e14 → `surface` #111722 (cards, tab bar, rail) →
  `surfaceRaised` #182030 (inputs, nested) → `surfaceOverlay` #1f2939 (pressed, selected, tracks).
  Elevation = lighter surface first, shadow second.
- Text: `ink` #eef2f7, `inkMuted` #a3b0c2 (metadata), `inkSubtle` #8391a6 (coordinates,
  placeholders; not on `surfaceOverlay` below 15 px). Never pure white.
- Amber: `amber` #f5b544, `amberPressed`, `amberSoft` (16% tint fills), `onAmber` #1c1405 for text on
  amber (never white on amber). One amber-filled button per screen.
- Aurora: `auroraTeal` #2dd4bf → `auroraViolet` #8b5cf6. Violet is a mark colour only; violet text
  uses `violetInk` #b9a6ff. Wishlist = violet so "want to go" never reads as "been there".
- Status: success = `auroraTeal`, errors = `danger` #ff7a70, always with an icon or word.
- Lines: `hairline` (decorative only), `controlBorder` (inputs, secondary buttons, switches; 3:1).
- Glass (`glass`, `glassFallback`): panels floating over the map only (search bar, map sheet,
  tab bar, map buttons). v1 uses `glassFallback` (94% `surface`) without a blur library.
- Map: `mapWater` darker than `mapLand`, thin `mapBorder`, quiet `mapLabel`, roads only at street zoom.
- Contrast: every text pair ≥ 4.5:1, marks/borders/focus ≥ 3:1 (checked in the design system).

## Typography (`src/theme/typography.ts`)

Three families, one job each:

- **Fraunces** (display serif, the journal voice): journey and memory titles only —
  `displayXl` 40/44, `display` 32/36, `title` 22/28. One display or displayXl per screen.
- **Manrope** (interface): `heading` 20/26 bold, `subheading` 17/24, `body` 15/22,
  `bodyStrong`, `caption` 13/18, `label` 12/16.
- **Space Grotesk** (data): `statXl` 44/48, `stat` 28/32, `overline` 11/14 uppercase +0.08em,
  `coord` 12/16. Numbers use tabular figures.

Sentence case everywhere; uppercase only in `overline`. Text is always drawn at 1× (see "Deliberate
exceptions").

## Shape and motion

- Corners: soft. `radius.sm` 8 (grid thumbs), `md` 12 (buttons, inputs), `lg` 20 (cards, photos,
  panels), `xl` 28 (sheet top corners), `pill` (chips, search, tab bar, FAB, pins).
- Spacing: 4 px base. Phone gutter 16 + safe area; tablet gutter 24.
- Density: airy on detail screens, compact in lists.
- Motion personality: **calm, then delightful.** Reanimated springs from `src/theme/motion.ts`:
  `standard` (presses, pins, switches), `gentle` (sheets, panels). Press = scale 0.97.
  Expressive moments only: pin drop (small overshoot), route replay (line draws,
  ~1.5 s per 1,000 km), stat numbers count up once (800 ms).

## Components (from the design system)

Buttons (primary amber, secondary outline, ghost, danger outline, round glass icon button, 56 px
round FAB), Chip (default, selected amber, wish violet, live aurora outline), TextField (focus amber,
error danger + message), Switch (amber when on), JourneyCard, MemoryCard (timeline row with step
number and amber dot), StatTile + aurora ring, MapPin (dot, photo, cluster badge, selected, wish ring,
live pulse), MapSheet (glass bottom sheet), Navigation (phone floating pill tab bar: Map · Journeys ·
Stats · Settings; tablet 88 px rail with the FAB on top and Settings at the bottom).

## Layout

- Phone (compact): single column, floating tab bar, content scrolls under it, map previews as
  bottom sheets, add/edit as full screens.
- Tablet (medium/expanded): nav rail left; Map/Journeys show a 400 px side panel on the right instead
  of sheets; Journey detail puts route map and timeline side by side; Stats is a 3-column dashboard;
  add/edit open as centred dialogs. 3-column photo grids at expanded width.
- Layout follows `useWindowClass`, never the device model; handle all four safe-area edges in landscape.

## Iconography and imagery

- Icons: Lucide (`lucide-react-native`), 1.75 stroke, 22 px in tabs/buttons, 18 px inline. No filled
  icons, no emoji. The only filled shapes are pins.
- User photos are never filtered; only a bottom scrim gradient where text sits on an image.
- No cover photo yet → `surfaceOverlay` block with a map icon, never stock imagery.

## Content

- Voice: warm, personal, second person. "Your first trip to Ladakh", not "Trip created successfully".
- Buttons are verbs: "Add memory", "Start journey", "Open memory". Never "OK" / "Submit".
- Dates `12–15 Mar 2026`, `Today`, `2 years ago`; distances `1,240 km`; counts `6 memories`.
- Empty states invite: "No journeys yet — your map is waiting."
- Demo data: Indian trips (Spiti Valley, Monsoon in Udaipur, Goa off-season, Rann Utsav weekend,
  Kerala by train) plus a couple abroad, with bundled sample photos.

## Deliberate exceptions to the `ui-design-quality` skill

These are intentional and approved; do not "fix" them:

- **Three type families** (skill says at most two): each has one exclusive role above.
- **Teal → violet gradient**: allowed only on routes, rings/progress, live pulse and the live chip;
  never on backgrounds, cards, headings or text.
- **Glass panels**: only over the map, never on plain screens.
- **Fixed 1× font scale**: owner decision. `AppText` and `TextField` set
  `allowFontScaling={false}`, so the system font size is ignored.

## Must-have screens

Map, Journeys, Journey detail, Memory detail, Add/edit memory, New/edit journey, Stats, Settings,
Wishlist — each for phone and tablet as in the reference designs.
