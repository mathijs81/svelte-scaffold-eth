import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import type { Abi } from "viem";
import { config } from "$lib/wagmi/config";
import {
  type ChainId,
  type ContractName,
  createDeployedContractInfo,
} from "./createDeployedContractInfo.svelte";

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
  isConfirming = $state(false);
  isConfirmed = $state(false);
  error = $state<Error | null>(null);
  hash = $state<`0x${string}` | undefined>(undefined);

  private contractInfo: { address: `0x${string}`; abi: Abi } | null;
  private functionName: string;
  private value: bigint | undefined;

  constructor(params: WriteContractParams<TAbi>) {
    this.functionName = params.functionName;
    this.value = params.value;

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
    this.isConfirming = false;
    this.isConfirmed = false;
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
      this.isConfirming = true;

      await waitForTransactionReceipt(config, {
        hash: txHash,
        chainId: parseInt(
          this.contractInfo.address,
          10,
        ) as (typeof config)["chains"][number]["id"],
      });

      this.isConfirming = false;
      this.isConfirmed = true;

      setTimeout(() => {
        this.isConfirmed = false;
      }, 3000);
    } catch (e) {
      this.error = e instanceof Error ? e : new Error(String(e));
      this.isPending = false;
      this.isConfirming = false;
    }
  }
}

/**
 * Reactive utility to write to a contract
 *
 * @param params - Write contract parameters
 * @returns Object with writeContract function and transaction states
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const { writeContract, isPending, isConfirming, isConfirmed, error, hash } =
 *     createWriteContract({
 *       contractName: 'YourContract',
 *       functionName: 'setGreeting'
 *     });
 *
 *   function updateGreeting() {
 *     writeContract(['Hello from Svelte!']);
 *   }
 * </script>
 *
 * <button onclick={updateGreeting} disabled={isPending || isConfirming}>
 *   {#if isPending}
 *     Waiting for approval...
 *   {:else if isConfirming}
 *     Confirming...
 *   {:else if isConfirmed}
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
    writeContract: (args: Parameters<typeof writeContract>[1]["args"] = []) =>
      data.write(args),
    get isPending() {
      return data.isPending;
    },
    get isConfirming() {
      return data.isConfirming;
    },
    get isConfirmed() {
      return data.isConfirmed;
    },
    get error() {
      return data.error;
    },
    get hash() {
      return data.hash;
    },
  };
}
