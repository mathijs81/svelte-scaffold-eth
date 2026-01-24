/**
 * TanStack Query integration for blockchain data
 *
 * This module provides simplified wrappers around @wagmi/core/query helpers
 * with configurable update strategies for efficient blockchain data fetching.
 */

// Configuration
export {
  queryConfig,
  createBlockchainQueryClient,
  type UpdateStrategy,
} from "./config";

// Block watcher for automatic query invalidation
export { setupBlockWatcher, setupEventWatcher } from "./blockWatcher.svelte";

// Contract reads
export {
  useContractRead,
  type UseContractReadOptions,
} from "./contractReads.svelte";

// Contract writes
export {
  useContractWrite,
  useTransactionReceipt,
  type UseContractWriteOptions,
} from "./contractWrites.svelte";

// Network information
export {
  useBalance,
  useBlockNumber,
  useBlock,
  useNetworkInfo,
} from "./networkInfo.svelte";
