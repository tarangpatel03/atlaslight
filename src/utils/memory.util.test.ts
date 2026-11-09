import {
  formatCoordinates,
  formatMemoryDeletion,
  mergeDay,
  mergeTime,
  placeLines,
  toStopInput,
} from './memory.util';

const at = (y: number, m: number, d: number, h: number, min: number): number =>
  new Date(y, m, d, h, min).getTime();

describe('mergeDay', () => {
  it('moves to the picked day and keeps the time of day', () => {
    const visited = at(2026, 10, 3, 17, 45);
    const picked = at(2026, 10, 8, 12, 0);
    expect(mergeDay(visited, picked)).toBe(at(2026, 10, 8, 17, 45));
  });
});

describe('mergeTime', () => {
  it('keeps the day and sets the time', () => {
    expect(mergeTime(at(2026, 10, 3, 9, 5), 22, 30)).toBe(at(2026, 10, 3, 22, 30));
  });
});

describe('toStopInput', () => {
  const base = {
    title: '  Fort Kochi walk ',
    latitude: 9.96,
    longitude: 76.24,
    visitedAt: 1,
    mood: null,
    mediaCount: 0,
  };

  it('trims the title and the note', () => {
    const input = toStopInput({ ...base, note: '  sunrise  ' });
    expect(input.title).toBe('Fort Kochi walk');
    expect(input.note).toBe('sunrise');
  });

  it('turns an empty or missing note into null', () => {
    expect(toStopInput({ ...base, note: '   ' }).note).toBeNull();
    expect(toStopInput(base).note).toBeNull();
  });
});

describe('formatMemoryDeletion', () => {
  it('names what is removed', () => {
    expect(formatMemoryDeletion(0)).toBe('Deletes this memory from this phone.');
    expect(formatMemoryDeletion(1)).toBe(
      'Deletes this memory and its 1 photo or video from this phone.',
    );
    expect(formatMemoryDeletion(3)).toBe(
      'Deletes this memory and its 3 photos and videos from this phone.',
    );
  });
});

describe('formatCoordinates', () => {
  it('writes four decimals and the hemisphere', () => {
    expect(formatCoordinates(8.7333, 76.7)).toBe('8.7333° N, 76.7000° E');
    expect(formatCoordinates(-33.8688, -70.5)).toBe('33.8688° S, 70.5000° W');
  });
});

describe('placeLines', () => {
  it('joins the parts and skips empty ones and a repeat of the name', () => {
    expect(
      placeLines({ name: 'Varkala', locality: 'Varkala', adminArea: 'Kerala', countryName: 'India' }),
    ).toEqual({ name: 'Varkala', detail: 'Kerala, India' });
    expect(
      placeLines({ name: 'Fort Kochi', locality: null, adminArea: null, countryName: null }),
    ).toEqual({ name: 'Fort Kochi', detail: '' });
  });
});
