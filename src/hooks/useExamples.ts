import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchExamples } from '@/api/example.api';
import type { ExampleFilters, ExampleItem } from '@/api/types/example.types';
import { exampleKeys } from '@/api/queryKeys';

// EXAMPLE: delete or replace. Pattern for a query hook: key from the key factory, fetcher from api/.
export const useExamples = (filters: ExampleFilters): UseQueryResult<ExampleItem[], Error> =>
  useQuery({
    queryKey: exampleKeys.list(filters),
    queryFn: () => fetchExamples(filters),
  });
