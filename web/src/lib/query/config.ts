import { QueryClient } from "@tanstack/svelte-query";

export const DEFAULT_STALE_TIME = 5_000;
export const DEFAULT_WATCH_INTERVAL = 5_000;

/**
 * Create a QueryClient configured for blockchain data
 */
export function createBlockchainQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 3,
        retryOnMount: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}
