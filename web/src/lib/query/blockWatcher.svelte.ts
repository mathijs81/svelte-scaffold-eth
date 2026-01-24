import type { QueryClient } from "@tanstack/svelte-query";
import { watchBlockNumber, watchContractEvent } from "@wagmi/core";
import { config as wagmiConfig } from "$lib/wagmi/config";
import { queryConfig } from "./config";
import type { Abi, ContractEventName, Log } from "viem";
import type { WagmiChain } from "$lib/utils/types";

/**
 * Sets up automatic query invalidation on new blocks
 *
 * When a new block is detected, this will invalidate queries based on the
 * configuration in queryConfig. This ensures that blockchain data stays fresh
 * without manual polling.
 *
 * @param queryClient The TanStack Query client instance
 * @returns Cleanup function to stop watching blocks
 */
export function setupBlockWatcher(queryClient: QueryClient): () => void {
  if (!queryConfig.enableBlockInvalidation) {
    return () => {}; // No-op if disabled
  }

  const unwatch = watchBlockNumber(wagmiConfig, {
    onBlockNumber(_blockNumber) {
      // Determine which queries to invalidate
      const targets = queryConfig.blockInvalidationTargets;

      if (targets.length === 0) {
        // Invalidate all queries
        queryClient.invalidateQueries({
          refetchType: queryConfig.invalidateActiveOnly ? "active" : "all",
        });
      } else {
        // Invalidate specific query types
        for (const target of targets) {
          queryClient.invalidateQueries({
            queryKey: [target],
            refetchType: queryConfig.invalidateActiveOnly ? "active" : "all",
          });
        }
      }
    },
    // Optional: Can add per-chain watchers here
    // chainId: getTargetNetwork().id,
  });

  return unwatch;
}

/**
 * Setup contract event listener for targeted query invalidation
 *
 * This is more efficient than block-based invalidation for specific contracts.
 * Instead of invalidating on every block, we only invalidate when relevant
 * events are emitted.
 *
 * @example
 * ```ts
 * import { YourContract } from '$lib/contracts';
 *
 * setupEventWatcher(queryClient, {
 *   address: YourContract.address,
 *   abi: YourContract.abi,
 *   eventName: 'Transfer',
 *   onEvent: (event) => {
 *     // Invalidate balance queries for affected addresses
 *     queryClient.invalidateQueries({
 *       queryKey: ['balance', event.args.from],
 *     });
 *     queryClient.invalidateQueries({
 *       queryKey: ['balance', event.args.to],
 *     });
 *   }
 * });
 * ```
 */
export function setupEventWatcher<
  TAbi extends Abi,
  TEventName extends ContractEventName<TAbi>,
>(config: {
  address: `0x${string}`;
  abi: TAbi;
  eventName: TEventName;
  onEvent: (event: Log) => void;
  chainId?: WagmiChain;
}): () => void {
  const unwatch = watchContractEvent(wagmiConfig, {
    address: config.address,
    abi: config.abi,
    eventName: config.eventName,
    onLogs: (logs: Log[]) => {
      for (const log of logs) {
        config.onEvent(log);
      }
    },
    chainId: config.chainId,
  });

  return unwatch;
}
