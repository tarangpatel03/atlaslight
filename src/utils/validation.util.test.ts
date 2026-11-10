import { journeySchema, memorySchema } from './validation.util';

const journey = { title: 'Spiti Valley', startDate: 1000, endDate: 2000 };
const memory = {
  title: 'Key Monastery',
  latitude: 32.2,
  longitude: 78,
  altitude: null,
  visitedAt: 1000,
  mood: null,
  mediaCount: 3,
};

describe('journeySchema', () => {
  it('accepts a finished and an ongoing journey', () => {
    expect(journeySchema.safeParse(journey).success).toBe(true);
    expect(journeySchema.safeParse({ ...journey, endDate: null }).success).toBe(true);
  });

  it('trims the title and rejects an empty one', () => {
    expect(journeySchema.parse({ ...journey, title: '  Goa  ' }).title).toBe('Goa');
    expect(journeySchema.safeParse({ ...journey, title: '   ' }).success).toBe(false);
  });

  it('rejects a title over 60 characters', () => {
    expect(journeySchema.safeParse({ ...journey, title: 'a'.repeat(61) }).success).toBe(false);
  });

  it('rejects an end date before the start date', () => {
    expect(journeySchema.safeParse({ ...journey, endDate: 500 }).success).toBe(false);
  });

  it('requires a start date', () => {
    expect(journeySchema.safeParse({ title: 'Goa', endDate: null }).success).toBe(false);
  });
});

describe('memorySchema', () => {
  it('accepts a complete memory', () => {
    expect(memorySchema.safeParse(memory).success).toBe(true);
  });

  it('requires a title of 1 to 80 characters', () => {
    expect(memorySchema.safeParse({ ...memory, title: '' }).success).toBe(false);
    expect(memorySchema.safeParse({ ...memory, title: 'a'.repeat(81) }).success).toBe(false);
  });

  it('requires a location', () => {
    expect(memorySchema.safeParse({ ...memory, latitude: undefined }).success).toBe(false);
    expect(memorySchema.safeParse({ ...memory, longitude: 200 }).success).toBe(false);
  });

  it('limits the note to 2,000 characters', () => {
    expect(memorySchema.safeParse({ ...memory, note: 'a'.repeat(2000) }).success).toBe(true);
    expect(memorySchema.safeParse({ ...memory, note: 'a'.repeat(2001) }).success).toBe(false);
  });

  it('limits media to 30 per add and knows the moods', () => {
    expect(memorySchema.safeParse({ ...memory, mediaCount: 31 }).success).toBe(false);
    expect(memorySchema.safeParse({ ...memory, mood: 'calm' }).success).toBe(true);
    expect(memorySchema.safeParse({ ...memory, mood: 'angry' }).success).toBe(false);
    expect(memorySchema.safeParse({ ...memory, altitude: 4270 }).success).toBe(true);
    expect(memorySchema.safeParse({ ...memory, altitude: 12000 }).success).toBe(false);
  });
});
