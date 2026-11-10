import { searchLocal } from './mapSearch.util';

const stop = (id: string, title: string, journeyId: string, journeyTitle: string) => ({
  id,
  title,
  journeyId,
  journeyTitle,
});

const stops = [
  stop('a', 'Sunrise at Pangong', 'j1', 'Ladakh road trip'),
  stop('b', 'Leh market', 'j1', 'Ladakh road trip'),
  stop('c', 'Old Leh palace', 'j1', 'Ladakh road trip'),
  stop('d', 'Beach walk', 'j2', 'Goa off-season'),
];

describe('searchLocal', () => {
  it('returns nothing for blank text', () => {
    expect(searchLocal(stops, '   ')).toEqual({ memories: [], journeys: [] });
  });

  it('matches memory titles case-insensitively, prefix matches first', () => {
    const { memories } = searchLocal(stops, 'LEH');
    expect(memories.map((item) => item.id)).toEqual(['b', 'c']);
  });

  it('lists a matching journey once', () => {
    const { journeys } = searchLocal(stops, 'ladakh');
    expect(journeys).toEqual([{ id: 'j1', title: 'Ladakh road trip' }]);
  });

  it('finds journeys and memories separately', () => {
    const result = searchLocal(stops, 'goa');
    expect(result.memories).toEqual([]);
    expect(result.journeys).toEqual([{ id: 'j2', title: 'Goa off-season' }]);
  });

  it('caps each group', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      stop(`s${i}`, `Cafe ${i}`, `j${i}`, `Trip ${i}`),
    );
    const result = searchLocal(many, 'cafe');
    expect(result.memories).toHaveLength(4);
    expect(searchLocal(many, 'trip').journeys).toHaveLength(4);
  });
});
