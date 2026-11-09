export type GridSpec = {
  /** Space left and right of the grid. */
  margin: number;
  /** Space between columns. */
  gap: number;
  /** Narrowest a card may get before a column is dropped. */
  minItem: number;
};

/** How many equal columns fit in a pane of this width; always at least 1. */
export const columnsForWidth = (paneWidth: number, { margin, gap, minItem }: GridSpec): number => {
  const inner = paneWidth - margin * 2;
  return Math.max(1, Math.floor((inner + gap) / (minItem + gap)));
};
