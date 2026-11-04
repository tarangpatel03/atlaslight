import type { ExampleFilters } from '@/api/types/example.types';
import { createQueryKeys } from '@/utils/queryKeyFactory.util';

/** Every React Query key is built here. Never type a query key array in a hook. */
export const exampleKeys = createQueryKeys<ExampleFilters>('example'); // EXAMPLE: delete or replace.
