import { readContract, watchBlockNumber } from "@wagmi/core";
import type { Abi } from "viem";
import { config } from "$lib/wagmi/config";
import {
  type ChainId,
  type ContractName,
  createDeployedContractInfo,
} from "./createDeployedContractInfo.svelte";

interface ReadContractParams<TAbi extends Abi = Abi> {
  contractName: ContractName<ChainId>;
  functionName: string;
  args?: readonly unknown[];
  chainId: ChainId;
  abi?: TAbi;
  address?: `0x${string}`;
  watch?: boolean;
  pollingInterval?: number;
}

class ReadContractData<TAbi extends Abi = Abi> {
  data = $state<unknown>(undefined);
  isLoading = $state(true);
  error = $state<Error | null>(null);

  private contractInfo: { address: `0x${string}`; abi: Abi } | null;
  private functionName: string;
  private args: readonly unknown[];
  private unwatchBlockNumber: (() => void) | undefined;

  constructor(params: ReadContractParams<TAbi>) {
    this.functionName = params.functionName;
    this.args = params.args ?? [];

    const {
      abi: customAbi,
      address: customAddress,
      contractName,
      chainId,
    } = params;

    this.contractInfo =
      customAbi && customAddress
        ? { address: customAddress, abi: customAbi }
        : createDeployedContractInfo(contractName, chainId);

    if (!this.contractInfo) {
      this.error = new Error(
        `Contract ${contractName} not found on chain ${chainId}`,
      );
      this.isLoading = false;
      return;
    }

    this.fetchData();

    if (params.watch) {
      this.startWatching(params.chainId, params.pollingInterval ?? 4000);
    }
  }

  async fetchData() {
    if (!this.contractInfo) return;

    this.isLoading = true;
    this.error = null;

    try {
      const result = await readContract(config, {
        address: this.contractInfo.address,
        abi: this.contractInfo.abi,
        functionName: this.functionName,
        args: this.args as Parameters<typeof readContract>[1]["args"],
      });
      this.data = result;
    } catch (e) {
      this.error = e instanceof Error ? e : new Error(String(e));
    } finally {
      this.isLoading = false;
    }
  }

  startWatching(chainId: ChainId, pollingInterval: number) {
    const data = this;
    let lastBlockNumber = 0n;

    this.unwatchBlockNumber = watchBlockNumber(config, {
      chainId: parseInt(chainId, 10) as (typeof config)["chains"][number]["id"],
      onBlockNumber(blockNumber) {
        if (blockNumber > lastBlockNumber) {
          lastBlockNumber = blockNumber;
          data.fetchData();
        }
      },
      pollingInterval,
    });
  }

  stopWatching() {
    this.unwatchBlockNumber?.();
  }
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
  const data = new ReadContractData(params);

  return {
    get data() {
      return data.data;
    },
    get isLoading() {
      return data.isLoading;
    },
    get error() {
      return data.error;
    },
    refetch: () => data.fetchData(),
  };
}
