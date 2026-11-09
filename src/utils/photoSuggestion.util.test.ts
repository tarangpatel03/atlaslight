import { groupPhotosByPlace, journeyPhotoWindow, type LocatedPhoto } from './photoSuggestion.util';

const HOUR = 60 * 60 * 1000;
const at = (day: number, hour: number): number => new Date(2026, 10, day, hour, 0).getTime();

const photo = (id: string, takenAt: number, latitude: number, longitude: number): LocatedPhoto => ({
  id,
  uri: `file:///${id}.jpg`,
  takenAt,
  latitude,
  longitude,
});

describe('journeyPhotoWindow', () => {
  it('spans whole days for an ended journey', () => {
    const { from, to } = journeyPhotoWindow(at(3, 12), at(9, 12), at(20, 12));
    expect(from).toBe(new Date(2026, 10, 3, 0, 0, 0, 0).getTime());
    expect(to).toBe(new Date(2026, 10, 9, 23, 59, 59, 999).getTime());
  });

  it('runs to now for an ongoing journey', () => {
    expect(journeyPhotoWindow(at(3, 12), null, at(9, 15)).to).toBe(at(9, 15));
  });
});

describe('groupPhotosByPlace', () => {
  it('groups photos that are close in place and time', () => {
    const groups = groupPhotosByPlace([
      photo('a', at(5, 10), 8.7333, 76.7),
      photo('b', at(5, 11), 8.7336, 76.7004),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ id: 'a', photoCount: 2, takenAt: at(5, 10) });
  });

  it('splits by distance', () => {
    const groups = groupPhotosByPlace([
      photo('a', at(5, 10), 8.7333, 76.7),
      photo('b', at(5, 10) + HOUR, 9.9312, 76.2673),
    ]);
    expect(groups).toHaveLength(2);
  });

  it('splits by time', () => {
    const groups = groupPhotosByPlace([
      photo('a', at(5, 8), 8.7333, 76.7),
      photo('b', at(6, 12), 8.7333, 76.7),
    ]);
    expect(groups).toHaveLength(2);
  });

  it('lists the newest group first and keeps at most six', () => {
    const many = Array.from({ length: 8 }, (_, i) => photo(`p${i}`, at(1 + i, 10), 10 + i, 76));
    const groups = groupPhotosByPlace(many);
    expect(groups).toHaveLength(6);
    expect(groups[0].id).toBe('p7');
  });

  it('returns nothing for no photos', () => {
    expect(groupPhotosByPlace([])).toEqual([]);
  });
});
