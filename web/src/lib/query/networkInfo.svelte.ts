import type { WagmiChain } from "$lib/utils/types";
import { config } from "$lib/wagmi/config";
import { createQuery } from "@tanstack/svelte-query";
import {
  getBalanceQueryOptions,
  getBlockNumberQueryOptions,
  getBlockQueryOptions,
} from "@wagmi/core/query";
import type { Address } from "viem";
import { getGlobalClient } from "./globalClient";
import { DEFAULT_WATCH_INTERVAL } from "./config";

/**
 * Hook to get the native balance of an address
 *
 * @example
 * ```ts
 * const balance = useBalance(address);
 * console.log($balance.data?.formatted); // "1.23"
 * console.log($balance.data?.symbol); // "ETH"
 * ```
 */
export function useBalance(
  address: Address | undefined,
  options?: {
    /**
     * Enable polling for this query
     * - false: no polling (default, relies on block watcher)
     * - true: poll at default interval (4s)
     * - number: poll at specific interval in milliseconds
     */
    watch?: boolean | number;
    chainId?: WagmiChain;
  },
) {
  const refetchInterval = $derived.by(() => {
    if (options?.watch === true) {
      return DEFAULT_WATCH_INTERVAL;
    }
    if (typeof options?.watch === "number") {
      return options.watch;
    }
    return false;
  });

  return createQuery(
    () =>
      getBalanceQueryOptions(config, {
        address,
        chainId: options?.chainId,
        query: {
          enabled: !!address,
          refetchInterval,
        },
      }),
    getGlobalClient(),
  );
}

// TODOLLM: add hook to get ERC20 token balance(s)

/**
 * Hook to get the current block number
 *
 * @example
 * ```ts
 * const blockNumber = useBlockNumber();
 * console.log($blockNumber.data); // 12345678n
 * ```
 */
export function useBlockNumber(options?: {
  /**
   * Enable polling for this query
   * - false: no polling (relies on block watcher)
   * - true: poll at default interval (4s) (default for this hook)
   * - number: poll at specific interval in milliseconds
   */
  watch?: boolean | number;
  chainId?: WagmiChain;
}) {
  const refetchInterval = $derived.by(() => {
    // Block number defaults to polling if watch is not specified
    if (options?.watch === undefined || options.watch === true) {
      return DEFAULT_WATCH_INTERVAL;
    }
    if (typeof options.watch === "number") {
      return options.watch;
    }
    return false;
  });

  return createQuery(
    () =>
      getBlockNumberQueryOptions(config, {
        chainId: options?.chainId,
        query: {
          refetchInterval,
          staleTime: 0,
        },
      }),
    getGlobalClient(),
  );
}

/**
 * Hook to get block information
 *
 * @example
 * ```ts
 * const block = useBlock();
 * console.log($block.data?.timestamp); // Unix timestamp
 * console.log($block.data?.hash); // Block hash
 * ```
 */
export function useBlock(options?: {
  blockNumber?: bigint;
  blockHash?: `0x${string}`;
  /**
   * Enable polling for this query
   * - false: no polling (default, relies on block watcher)
   * - true: poll at default interval (4s)
   * - number: poll at specific interval in milliseconds
   */
  watch?: boolean | number;
  chainId?: WagmiChain;
}) {
  const refetchInterval = $derived.by(() => {
    if (options?.watch === true) {
      return DEFAULT_WATCH_INTERVAL;
    }
    if (typeof options?.watch === "number") {
      return options.watch;
    }
    return false;
  });

  return createQuery(
    () =>
      getBlockQueryOptions(config, {
        blockNumber: options?.blockNumber,
        blockHash: options?.blockHash,
        chainId: options?.chainId,
        query: {
          refetchInterval,
          enabled: !!(options?.blockNumber || options?.blockHash),
        },
        // biome-ignore lint/suspicious/noExplicitAny: blockHash doesn't seem to be exposed in getBlockQueryOptions
      } as any),
    getGlobalClient(),
  );
}

/**
 * Combined hook for network information (balance + block data)
 * Similar to the old createNetworkInfo but using TanStack Query
 *
 * @example
 * ```ts
 * const networkInfo = useNetworkInfo(address);
 * console.log($networkInfo.balance.data?.formatted);
 * console.log($networkInfo.blockNumber.data);
 * ```
 */
export function useNetworkInfo(
  address: Address | undefined,
  options?: {
    /**
     * Enable polling for these queries
     * - false: no polling (default, relies on block watcher)
     * - true: poll at default interval (4s)
     * - number: poll at specific interval in milliseconds
     */
    watch?: boolean | number;
    chainId?: WagmiChain;
  },
) {
  const balance = useBalance(address, options);
  const blockNumber = useBlockNumber(options);
  const block = useBlock({
    ...options,
    blockNumber: blockNumber.data,
  });

  return {
    balance,
    blockNumber,
    block,
  };
}
