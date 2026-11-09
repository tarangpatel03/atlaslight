/** Kept free of Drizzle imports so pure utils (validation) and their Jest tests can use it. */
export const MOODS = ['happy', 'calm', 'adventurous', 'romantic', 'nostalgic', 'tired'] as const;
export type Mood = (typeof MOODS)[number];
