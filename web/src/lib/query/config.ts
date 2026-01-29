import { QueryClient } from "@tanstack/svelte-query";
import { hashFn } from "@wagmi/core/query";

/**
 * Update strategies for blockchain data queries
 *
 * - 'manual': No automatic updates, use refetch() manually
 * - 'block': Invalidate and refetch on every new block
 * - 'interval': Poll at a fixed interval (milliseconds)
 * - 'event': Listen to specific contract events (most efficient, requires event configuration)
 */
export type UpdateStrategy = "manual" | "block" | "interval" | "event";

/**
 * Configuration for query update behavior
 */
export interface QueryUpdateConfig {
  /**
   * Default update strategy for contract reads
   * @default 'block'
   */
  defaultStrategy: UpdateStrategy;

  /**
   * Default polling interval when using 'interval' strategy (ms)
   * @default 4000
   */
  defaultInterval: number;

  /**
   * Whether to enable block-based invalidation globally
   * When true, all queries with 'block' strategy will be invalidated on new blocks
   * @default true
   */
  enableBlockInvalidation: boolean;

  /**
   * Only invalidate 'active' queries on new blocks (not inactive/background queries)
   * This improves performance by not refetching data that's not currently displayed
   * @default true
   */
  invalidateActiveOnly: boolean;

  /**
   * Specific query types to invalidate on new blocks
   * If empty, all queries will be invalidated
   * @default ['readContract', 'balance', 'blockNumber']
   */
  blockInvalidationTargets: string[];
}

/**
 * Global query configuration
 */
export const queryConfig: QueryUpdateConfig = {
  defaultStrategy: "block",
  defaultInterval: 4000,
  enableBlockInvalidation: true,
  invalidateActiveOnly: true,
  blockInvalidationTargets: ["readContract", "balance", "blockNumber", "block"],
};

/**
 * Create a QueryClient configured for blockchain data
 */
export function createBlockchainQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 3,
        retryOnMount: false,
        refetchInterval: queryConfig.defaultInterval,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/**
 * Export hashFn for use with DevTools
 */
export { hashFn };
