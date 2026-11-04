import { QueryClient } from '@tanstack/react-query';

/** One client for the app. `retry: false` keeps errors visible; turn it on per query when it helps. */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});
