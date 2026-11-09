import { columnsForWidth } from './grid.util';

const spec = { margin: 24, gap: 16, minItem: 240 };

describe('columnsForWidth', () => {
  it('is 1 for a narrow pane', () => {
    expect(columnsForWidth(300, spec)).toBe(1);
  });

  it('never drops below 1, even for no width', () => {
    expect(columnsForWidth(0, spec)).toBe(1);
  });

  it('fits 2 columns once two cards and the gap fit between the margins', () => {
    // 2 * 240 + 16 = 496 inner, plus 2 * 24 margin.
    expect(columnsForWidth(543, spec)).toBe(1);
    expect(columnsForWidth(544, spec)).toBe(2);
  });

  it('fits 3 columns in a wide pane', () => {
    expect(columnsForWidth(900, spec)).toBe(3);
  });
});
