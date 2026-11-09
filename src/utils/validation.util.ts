import { z } from 'zod';

import { MOODS } from '@/db/moods';

/** Memory limits from the spec: up to 30 media per add, notes up to 2,000 characters. */
export const MAX_MEDIA_PER_ADD = 30;

export const journeySchema = z
  .object({
    title: z.string().trim().min(1, 'Give your journey a name').max(60, 'Keep the name under 60 characters'),
    description: z.string().trim().optional(),
    startDate: z.number({ error: 'Pick the day it started' }),
    endDate: z.number().nullable(),
  })
  .refine(journey => journey.endDate === null || journey.endDate >= journey.startDate, {
    message: 'The end date comes after the start date',
    path: ['endDate'],
  });

export type JourneyFormValues = z.infer<typeof journeySchema>;

export const memorySchema = z.object({
  title: z.string().trim().min(1, 'Give this memory a title').max(80, 'Keep the title under 80 characters'),
  latitude: z.number({ error: 'Choose where this happened' }).min(-90).max(90),
  longitude: z.number({ error: 'Choose where this happened' }).min(-180).max(180),
  visitedAt: z.number({ error: 'Pick when you were there' }),
  mood: z.enum(MOODS).nullable(),
  note: z.string().max(2000, 'Keep the note under 2,000 characters').optional(),
  mediaCount: z.number().max(MAX_MEDIA_PER_ADD, `Add up to ${MAX_MEDIA_PER_ADD} photos at a time`),
});

export type MemoryFormValues = z.infer<typeof memorySchema>;
