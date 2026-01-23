import { writeContract } from "@wagmi/core";
import type { Abi } from "viem";
import { config } from "$lib/wagmi/config";
import {
  type ChainId,
  type ContractName,
  createDeployedContractInfo,
} from "./createDeployedContractInfo.svelte";
import { txWatcher } from "./txWatcher.svelte";

interface WriteContractParams<TAbi extends Abi = Abi> {
  contractName: ContractName<ChainId>;
  functionName: string;
  chainId: ChainId;
  abi?: TAbi;
  address?: `0x${string}`;
  value?: bigint;
}

class WriteContractData<TAbi extends Abi = Abi> {
  isPending = $state(false);
  error = $state<Error | null>(null);
  hash = $state<`0x${string}` | undefined>(undefined);

  private contractInfo: { address: `0x${string}`; abi: Abi } | null;
  private functionName: string;
  private value: bigint | undefined;
  private contractName: string;
  private chainId: ChainId;

  constructor(params: WriteContractParams<TAbi>) {
    this.functionName = params.functionName;
    this.value = params.value;
    this.contractName = params.contractName as string;
    this.chainId = params.chainId;

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
    }
  }

  async write(args: Parameters<typeof writeContract>[1]["args"] = []) {
    if (!this.contractInfo) {
      this.error = new Error("Contract not found");
      return;
    }

    this.isPending = true;
    this.error = null;
    this.hash = undefined;

    try {
      const txHash = await writeContract(config, {
        address: this.contractInfo.address,
        abi: this.contractInfo.abi,
        functionName: this.functionName,
        args: args as Parameters<typeof writeContract>[1]["args"],
        value: this.value,
      });

      this.hash = txHash;
      this.isPending = false;

      const chainIdNum = Number.parseInt(this.chainId, 10);
      txWatcher.watch(txHash, chainIdNum, {
        contractName: this.contractName,
        functionName: this.functionName,
      });

      return txHash;
    } catch (e) {
      this.error = e instanceof Error ? e : new Error(String(e));
      this.isPending = false;
    }
  }

  get txState() {
    return this.hash ? txWatcher.getTransaction(this.hash) : undefined;
  }
}

/**
 * Reactive utility to write to a contract
 *
 * Uses the global transaction watcher for lifecycle management.
 * Transaction state updates (confirming, confirmed, failed) are tracked
 * via the txState property which subscribes to the txWatcher.
 *
 * @param params - Write contract parameters
 * @returns Object with writeContract function and transaction states
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const writer = createWriteContract({
 *     contractName: 'YourContract',
 *     functionName: 'setGreeting',
 *     chainId: 31337
 *   });
 *
 *   function updateGreeting() {
 *     writer.write(['Hello from Svelte!']);
 *   }
 * </script>
 *
 * <button onclick={updateGreeting} disabled={writer.isPending || writer.txState?.status === 'confirming'}>
 *   {#if writer.isPending}
 *     Waiting for approval...
 *   {:else if writer.txState?.status === 'confirming'}
 *     Confirming...
 *   {:else if writer.txState?.status === 'confirmed'}
 *     Confirmed!
 *   {:else}
 *     Update Greeting
 *   {/if}
 * </button>
 * ```
 */
export function createWriteContract<TAbi extends Abi = Abi>(
  params: WriteContractParams<TAbi>,
) {
  const data = new WriteContractData(params);

  return {
    write: (args: Parameters<typeof writeContract>[1]["args"] = []) =>
      data.write(args),
    get isPending() {
      return data.isPending;
    },
    get error() {
      return data.error;
    },
    get hash() {
      return data.hash;
    },
    get txState() {
      return data.txState;
    },
  };
}
