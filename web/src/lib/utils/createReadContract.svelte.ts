import { readContract, watchBlockNumber } from "@wagmi/core";
import { config } from "$lib/wagmi/config";
import {
  createDeployedContractInfo,
  type ChainId,
  type ContractName,
} from "./createDeployedContractInfo.svelte";
import type { Abi } from "viem";

interface ReadContractParams<TAbi extends Abi = Abi> {
  /** Contract name from deployedContracts */
  contractName: ContractName<ChainId>;
  /** Function name to call */
  functionName: string;
  /** Function arguments (if any) */
  args?: readonly unknown[];
  /** Chain ID (defaults to current chain) */
  chainId: ChainId;
  /** Custom ABI (optional, uses deployed contract ABI by default) */
  abi?: TAbi;
  /** Custom address (optional, uses deployed contract address by default) */
  address?: `0x${string}`;
  /** Whether to watch for changes and auto-refetch (default: false) */
  watch?: boolean;
  /** Polling interval in ms when watch is enabled (default: 4000) */
  pollingInterval?: number;
}

/**
 * Reactive utility to read contract state
 *
 * @param params - Read contract parameters
 * @returns Reactive state with data, loading, and error states
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const greeting = createReadContract({
 *     contractName: 'YourContract',
 *     functionName: 'greeting',
 *     watch: true  // Auto-refresh on new blocks
 *   });
 * </script>
 *
 * {#if greeting.isLoading}
 *   <p>Loading...</p>
 * {:else if greeting.error}
 *   <p>Error: {greeting.error.message}</p>
 * {:else}
 *   <p>Greeting: {greeting.data}</p>
 * {/if}
 * ```
 */
export function createReadContract<TAbi extends Abi = Abi>(
  params: ReadContractParams<TAbi>,
) {
  let data = $state<unknown>(undefined);
  let isLoading = $state(true);
  let error = $state<Error | null>(null);

  const {
    contractName,
    functionName,
    args = [],
    chainId,
    abi: customAbi,
    address: customAddress,
    watch = false,
    pollingInterval = 4000,
  } = params;

  // Get contract info
  const contractInfo =
    customAbi && customAddress
      ? { address: customAddress, abi: customAbi }
      : createDeployedContractInfo(contractName, chainId);

  if (!contractInfo) {
    error = new Error(`Contract ${contractName} not found on chain ${chainId}`);
    isLoading = false;
  }

  // Function to fetch data
  async function fetchData() {
    if (!contractInfo) return;

    isLoading = true;
    error = null;

    try {
      const result = await readContract(config, {
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName,
        args: args as Parameters<typeof readContract>[1]["args"],
      });
      data = result;
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
    } finally {
      isLoading = false;
    }
  }

  // Initial fetch
  fetchData();

  // Set up watching with automatic cleanup
  if (watch && contractInfo) {
    $effect(() => {
      let lastBlockNumber = 0n;

      const unwatchBlockNumber = watchBlockNumber(config, {
        chainId: parseInt(
          chainId,
          10,
        ) as (typeof config)["chains"][number]["id"],
        onBlockNumber(blockNumber) {
          if (blockNumber > lastBlockNumber) {
            lastBlockNumber = blockNumber;
            fetchData();
          }
        },
        pollingInterval,
      });

      return unwatchBlockNumber;
    });
  }

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
