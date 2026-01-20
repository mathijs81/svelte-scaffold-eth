import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "$lib/wagmi/config";
import {
  createDeployedContractInfo,
  type ChainId,
  type ContractName,
} from "./createDeployedContractInfo.svelte";
import type { Abi } from "viem";

interface WriteContractParams<TAbi extends Abi = Abi> {
  /** Contract name from deployedContracts */
  contractName: ContractName<ChainId>;
  /** Function name to call */
  functionName: string;
  /** Chain ID (defaults to current chain) */
  chainId?: ChainId;
  /** Custom ABI (optional, uses deployed contract ABI by default) */
  abi?: TAbi;
  /** Custom address (optional, uses deployed contract address by default) */
  address?: `0x${string}`;
  /** Value to send with transaction (in wei) */
  value?: bigint;
}

/**
 * Reactive rune to write to a contract
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
  let isPending = $state(false);
  let isConfirming = $state(false);
  let isConfirmed = $state(false);
  let error = $state<Error | null>(null);
  let hash = $state<`0x${string}` | undefined>(undefined);

  const {
    contractName,
    functionName,
    chainId = 31337,
    abi: customAbi,
    address: customAddress,
    value,
  } = params;

  // Get contract info
  const contractInfo =
    customAbi && customAddress
      ? { address: customAddress, abi: customAbi }
      : createDeployedContractInfo(contractName as any, chainId as any);

  if (!contractInfo) {
    error = new Error(`Contract ${contractName} not found on chain ${chainId}`);
  }

  /**
   * Execute the contract write
   * @param args - Function arguments
   */
  async function write(args: readonly unknown[] = []) {
    if (!contractInfo) {
      error = new Error(
        `Contract ${contractName} not found on chain ${chainId}`,
      );
      return;
    }

    isPending = true;
    isConfirming = false;
    isConfirmed = false;
    error = null;
    hash = undefined;

    try {
      // Write to contract
      const txHash = await writeContract(config, {
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName,
        args: args as any,
        value,
      } as any);

      hash = txHash;
      isPending = false;
      isConfirming = true;

      // Wait for transaction confirmation
      await waitForTransactionReceipt(config, {
        hash: txHash,
        chainId,
      });

      isConfirming = false;
      isConfirmed = true;

      // Reset confirmed state after 3 seconds
      setTimeout(() => {
        isConfirmed = false;
      }, 3000);
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      isPending = false;
      isConfirming = false;
    }
  }

  return {
    writeContract: write,
    get isPending() {
      return isPending;
    },
    get isConfirming() {
      return isConfirming;
    },
    get isConfirmed() {
      return isConfirmed;
    },
    get error() {
      return error;
    },
    get hash() {
      return hash;
    },
  };
}
