import type { DemoPhotoKey } from '@/assets/demo';
import type { Mood } from '@/db/moods';

/** One memory of a demo journey. `day` is the number of days after the journey's start. */
export type DemoStop = {
  title: string;
  note: string;
  mood: Mood | null;
  latitude: number;
  longitude: number;
  day: number;
  hour: number;
  place: { name: string; locality: string | null; adminArea: string | null };
  photos: DemoPhotoKey[];
};

export type DemoJourney = {
  /** Ids are `demo-<slug>` and `demo-<slug>-<n>`, so the seed can tell what is already loaded. */
  slug: string;
  title: string;
  description: string;
  /** Local-time start, or a start relative to the day the seed runs (the ongoing journey). */
  start: { year: number; month: number; day: number } | { daysAgo: number };
  /** Days of the trip including the first; null = still ongoing. */
  lengthDays: number | null;
  country: { code: string; name: string };
  stops: DemoStop[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

const IN = { code: 'IN', name: 'India' };

const stop = (
  day: number,
  hour: number,
  title: string,
  [latitude, longitude]: [number, number],
  place: DemoStop['place'],
  mood: Mood | null,
  photos: DemoPhotoKey[],
  note: string,
): DemoStop => ({ day, hour, title, note, mood, latitude, longitude, place, photos });

export const DEMO_JOURNEYS: DemoJourney[] = [
  {
    slug: 'spiti-valley',
    title: 'Spiti Valley',
    description: 'Nine days up the valley, from apple orchards to the high desert.',
    start: { year: 2025, month: 5, day: 12 },
    lengthDays: 9,
    country: IN,
    stops: [
      stop(
        0,
        16,
        'Apples in Kalpa',
        [31.5339, 78.2587],
        { name: 'Kalpa', locality: 'Kinnaur', adminArea: 'Himachal Pradesh' },
        'calm',
        ['portrait'],
        'Kinner Kailash turned pink at sunset and nobody spoke for a while.',
      ),
      stop(
        2,
        11,
        'Nako lake at noon',
        [31.8773, 78.6362],
        { name: 'Nako Lake', locality: 'Nako', adminArea: 'Himachal Pradesh' },
        'calm',
        ['landscape'],
        'The lake was glass. We ate warm thukpa on the shore.',
      ),
      stop(
        3,
        15,
        'Tabo, the Ajanta of the Himalayas',
        [32.0933, 78.3856],
        { name: 'Tabo Monastery', locality: 'Tabo', adminArea: 'Himachal Pradesh' },
        'nostalgic',
        ['portrait'],
        'A thousand years of painted walls, lit by one small lamp.',
      ),
      stop(
        5,
        10,
        'Kibber at 4,200 metres',
        [32.3339, 78.0072],
        { name: 'Kibber', locality: 'Spiti', adminArea: 'Himachal Pradesh' },
        'adventurous',
        ['landscape', 'portrait'],
        'Thin air, huge sky, and the highest tea I have ever had.',
      ),
      stop(
        6,
        9,
        'Key Monastery, early',
        [32.2961, 78.0105],
        { name: 'Key Gompa', locality: 'Key', adminArea: 'Himachal Pradesh' },
        'happy',
        ['landscape'],
        'We came for the morning prayers and stayed for the view.',
      ),
      stop(
        8,
        17,
        'Chandratal, the moon lake',
        [32.4775, 77.6142],
        { name: 'Chandratal', locality: 'Lahaul and Spiti', adminArea: 'Himachal Pradesh' },
        'adventurous',
        ['landscape', 'portrait'],
        'Camped by the water. The stars came down to meet us.',
      ),
    ],
  },
  {
    slug: 'monsoon-in-udaipur',
    title: 'Monsoon in Udaipur',
    description: 'Four rainy days around the lakes of the City of Lakes.',
    start: { year: 2025, month: 7, day: 22 },
    lengthDays: 4,
    country: IN,
    stops: [
      stop(
        0,
        12,
        'City Palace in the rain',
        [24.5764, 73.6835],
        { name: 'City Palace', locality: 'Udaipur', adminArea: 'Rajasthan' },
        'romantic',
        ['landscape'],
        'Marble courtyards and a drizzle that never quite stopped.',
      ),
      stop(
        0,
        18,
        'Boat on Lake Pichola',
        [24.5726, 73.6797],
        { name: 'Lake Pichola', locality: 'Udaipur', adminArea: 'Rajasthan' },
        'calm',
        ['portrait'],
        'The boatman hummed the whole way across.',
      ),
      stop(
        1,
        15,
        'Above the clouds at Sajjangarh',
        [24.5985, 73.6355],
        { name: 'Sajjangarh Monsoon Palace', locality: 'Udaipur', adminArea: 'Rajasthan' },
        'adventurous',
        ['landscape'],
        'We climbed into the mist and it opened over the whole valley.',
      ),
      stop(
        2,
        11,
        'Saheliyon-ki-Bari gardens',
        [24.5987, 73.6908],
        { name: 'Saheliyon-ki-Bari', locality: 'Udaipur', adminArea: 'Rajasthan' },
        'happy',
        [],
        'Fountains, puddles and a very good chai.',
      ),
      stop(
        3,
        19,
        'Fateh Sagar at dusk',
        [24.6049, 73.6745],
        { name: 'Fateh Sagar Lake', locality: 'Udaipur', adminArea: 'Rajasthan' },
        'calm',
        ['landscape'],
        'The last evening: corn on the cob, lights on the water.',
      ),
    ],
  },
  {
    slug: 'goa-off-season',
    title: 'Goa off-season',
    description: 'Empty beaches, green hills and shacks all to ourselves.',
    start: { year: 2024, month: 6, day: 5 },
    lengthDays: 5,
    country: IN,
    stops: [
      stop(
        0,
        17,
        'Anjuna, nearly empty',
        [15.5736, 73.7413],
        { name: 'Anjuna Beach', locality: 'Anjuna', adminArea: 'Goa' },
        'tired',
        ['portrait'],
        'Long journey, slow evening, one open shack.',
      ),
      stop(
        1,
        11,
        'Fort Aguada lighthouse',
        [15.4925, 73.7737],
        { name: 'Fort Aguada', locality: 'Candolim', adminArea: 'Goa' },
        'adventurous',
        ['landscape'],
        'The monsoon sea hit the cliffs like a drum.',
      ),
      stop(
        2,
        10,
        'Old Goa churches',
        [15.5009, 73.9116],
        { name: 'Basilica of Bom Jesus', locality: 'Old Goa', adminArea: 'Goa' },
        'nostalgic',
        ['portrait'],
        'Cool stone, soft light, the smell of wet laterite.',
      ),
      stop(
        4,
        16,
        'Palolem, last light',
        [15.01, 74.0232],
        { name: 'Palolem Beach', locality: 'Canacona', adminArea: 'Goa' },
        'calm',
        ['landscape'],
        'Swam until the rain came back.',
      ),
    ],
  },
  {
    slug: 'rann-utsav-weekend',
    title: 'Rann Utsav weekend',
    description: 'A long weekend on the white salt desert of Kutch.',
    start: { year: 2025, month: 11, day: 5 },
    lengthDays: 3,
    country: IN,
    stops: [
      stop(
        0,
        14,
        'Bhuj bazaar',
        [23.242, 69.6669],
        { name: 'Bhuj', locality: 'Kutch', adminArea: 'Gujarat' },
        'happy',
        ['landscape'],
        'Bandhani scarves, mirror work and far too many sweets.',
      ),
      stop(
        1,
        18,
        'The White Rann at sunset',
        [23.835, 69.662],
        { name: 'White Rann', locality: 'Dhordo', adminArea: 'Gujarat' },
        'romantic',
        ['landscape', 'portrait'],
        'Salt to the horizon, pink and gold in every direction.',
      ),
      stop(
        2,
        9,
        'Kala Dungar viewpoint',
        [23.831, 69.318],
        { name: 'Kala Dungar', locality: 'Kutch', adminArea: 'Gujarat' },
        'adventurous',
        ['portrait'],
        'The highest point in Kutch, and the flat white Rann below it.',
      ),
    ],
  },
  {
    slug: 'kerala-by-train',
    title: 'Kerala by train',
    description: 'Slow trains, green hills and backwaters, one stop at a time.',
    start: { daysAgo: 6 },
    lengthDays: null,
    country: IN,
    stops: [
      stop(
        0,
        16,
        'Fort Kochi walk',
        [9.9658, 76.2427],
        { name: 'Fort Kochi', locality: 'Kochi', adminArea: 'Kerala' },
        'happy',
        ['portrait'],
        'Chinese fishing nets at golden hour and a very good filter coffee.',
      ),
      stop(
        2,
        10,
        'Alleppey backwaters',
        [9.4981, 76.3388],
        { name: 'Alappuzha', locality: 'Alleppey', adminArea: 'Kerala' },
        'calm',
        ['landscape'],
        'A houseboat, a green canal and nothing to do until lunch.',
      ),
      stop(
        4,
        13,
        'Tea hills of Munnar',
        [10.0889, 77.0595],
        { name: 'Munnar', locality: 'Idukki', adminArea: 'Kerala' },
        'adventurous',
        ['landscape', 'portrait'],
        'Rows of tea running off into the mist.',
      ),
      stop(
        5,
        17,
        'Varkala cliff',
        [8.7379, 76.7163],
        { name: 'Varkala Cliff', locality: 'Varkala', adminArea: 'Kerala' },
        'calm',
        [],
        'End of the line for today. The sea does the talking.',
      ),
    ],
  },
  {
    slug: 'lisbon-in-winter',
    title: 'Lisbon in winter',
    description: 'Tiles, trams and custard tarts, with a day trip to Sintra.',
    start: { year: 2026, month: 1, day: 10 },
    lengthDays: 6,
    country: { code: 'PT', name: 'Portugal' },
    stops: [
      stop(
        0,
        15,
        'Lost in Alfama',
        [38.711, -9.1295],
        { name: 'Alfama', locality: 'Lisbon', adminArea: 'Lisbon' },
        'nostalgic',
        ['portrait'],
        'Every lane ends in a view; every view has a washing line.',
      ),
      stop(
        2,
        12,
        'Belém Tower',
        [38.6916, -9.216],
        { name: 'Belém Tower', locality: 'Lisbon', adminArea: 'Lisbon' },
        'happy',
        ['landscape'],
        'Pastéis de Belém first, the tower second.',
      ),
      stop(
        3,
        11,
        'Pena Palace, Sintra',
        [38.7877, -9.3906],
        { name: 'Pena Palace', locality: 'Sintra', adminArea: 'Lisbon' },
        'adventurous',
        ['portrait', 'landscape'],
        'Yellow and red towers in the fog. It looked like a toy.',
      ),
      stop(
        4,
        19,
        'LX Factory evening',
        [38.703, -9.179],
        { name: 'LX Factory', locality: 'Lisbon', adminArea: 'Lisbon' },
        'calm',
        [],
        'A bookshop, a bakery and a band tuning up.',
      ),
    ],
  },
  {
    slug: 'kyoto-in-autumn',
    title: 'Kyoto in autumn',
    description: 'Eight days of red maples, quiet temples and long walks.',
    start: { year: 2025, month: 10, day: 14 },
    lengthDays: 8,
    country: { code: 'JP', name: 'Japan' },
    stops: [
      stop(
        1,
        7,
        'Fushimi Inari before the crowds',
        [34.9671, 135.7727],
        { name: 'Fushimi Inari Taisha', locality: 'Kyoto', adminArea: 'Kyoto' },
        'adventurous',
        ['portrait'],
        'Ten thousand gates and the first hour all to ourselves.',
      ),
      stop(
        2,
        14,
        'Kinkaku-ji in gold',
        [35.0394, 135.7292],
        { name: 'Kinkaku-ji', locality: 'Kyoto', adminArea: 'Kyoto' },
        'calm',
        ['landscape'],
        'The pavilion shone on the pond, maples burning behind it.',
      ),
      stop(
        4,
        9,
        'Arashiyama bamboo grove',
        [35.017, 135.6713],
        { name: 'Arashiyama Bamboo Grove', locality: 'Kyoto', adminArea: 'Kyoto' },
        'happy',
        ['portrait'],
        'The wind in the bamboo is louder than you would think.',
      ),
      stop(
        6,
        20,
        'Gion after dark',
        [35.0037, 135.7756],
        { name: 'Gion', locality: 'Kyoto', adminArea: 'Kyoto' },
        'romantic',
        ['landscape'],
        'Lanterns, wooden lattices and a geiko hurrying past.',
      ),
      stop(
        7,
        10,
        "Philosopher's Path",
        [35.027, 135.7948],
        { name: "Philosopher's Path", locality: 'Kyoto', adminArea: 'Kyoto' },
        'nostalgic',
        [],
        'The last walk: leaves on the canal, a cat on every wall.',
      ),
    ],
  },
];

/** Local-time noon of a calendar day, so demo dates read the same in any timezone. */
const noon = (year: number, month: number, day: number): number =>
  new Date(year, month, day, 12).getTime();

/** Start and end of a demo journey; `now` anchors the ongoing one. */
export const demoJourneyDates = (
  journey: DemoJourney,
  now: number = Date.now(),
): { startDate: number; endDate: number | null } => {
  const startDate =
    'daysAgo' in journey.start
      ? noon(
          new Date(now).getFullYear(),
          new Date(now).getMonth(),
          new Date(now).getDate() - journey.start.daysAgo,
        )
      : noon(journey.start.year, journey.start.month, journey.start.day);
  const endDate =
    journey.lengthDays === null ? null : startDate + (journey.lengthDays - 1) * DAY_MS;
  return { startDate, endDate };
};

/** When a memory happened: its day inside the trip, at its hour of the day. */
export const demoStopVisitedAt = (startDate: number, stopItem: DemoStop): number =>
  startDate + stopItem.day * DAY_MS + (stopItem.hour - 12) * 60 * 60 * 1000;
