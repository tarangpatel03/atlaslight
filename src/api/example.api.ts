import { apiRequest } from '@/api/client/axiosClient';
import type { ExampleFilters, ExampleItem } from '@/api/types/example.types';
import { ENDPOINTS } from '@/api/routes';

// EXAMPLE: delete or replace. One function per endpoint; hooks call these, screens never call axios.
export const fetchExamples = (filters: ExampleFilters): Promise<ExampleItem[]> =>
  apiRequest<ExampleItem[]>(ENDPOINTS.example.list, {
    params: { search: filters.search || undefined },
  });
