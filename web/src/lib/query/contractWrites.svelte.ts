import type { ContractName } from "$lib/contracts/deployedContracts";
import type { WagmiChain } from "$lib/utils/types";
import { config } from "$lib/wagmi/config";
import { createDeployedContractInfo } from "$lib/web3/createDeployedContractInfo.svelte";
import { txWatcher } from "$lib/web3/txWatcher.svelte";
import { createMutation, useQueryClient } from "@tanstack/svelte-query";
import type { Abi, TransactionReceipt } from "viem";

export interface UseContractWriteOptions {
  contract: `0x${string}` | ContractName;
  abi?: Abi;
  functionName?: string;
  chainId: WagmiChain;
  invalidateKeys?: string[][];
  waitForConfirmation?: boolean;
  confirmations?: number;
  onSent?: (hash: `0x${string}`) => void;
  onConfirmed?: (receipt: TransactionReceipt) => void;
  onError?: (error: Error) => void;
}

export function useContractWrite(options: UseContractWriteOptions) {
  const queryClient = useQueryClient();

  let contractAddress: `0x${string}`;
  let contractAbi: Abi;
  let contractName: string | undefined;

  if (
    typeof options.contract === "string" &&
    options.contract.startsWith("0x")
  ) {
    if (!options.abi) {
      throw new Error("ABI is required when using contract address directly");
    }
    contractAddress = options.contract as `0x${string}`;
    contractAbi = options.abi;
    contractName = undefined;
  } else {
    const contract = createDeployedContractInfo(
      options.contract,
      options.chainId,
    );
    if (!contract) {
      throw new Error(`Contract ${options.contract} not found`);
    }
    contractAddress = contract.address;
    contractAbi = options.abi || contract.abi;
    contractName = options.contract as string;
  }

  type Variables = {
    functionName?: string;
    args?: readonly unknown[];
    value?: bigint;
    gas?: bigint;
  };

  return createMutation(() => ({
    mutationFn: async (variables: Variables) => {
      const { writeContract } = await import("@wagmi/core");
      const functionName = options.functionName || variables.functionName;
      if (!functionName) {
        throw new Error("Function name is required");
      }
      return writeContract(config, {
        address: contractAddress,
        abi: contractAbi,
        functionName,
        args: variables.args,
        value: variables.value,
        gas: variables.gas,
      });
    },
    onMutate: async () => {
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          await queryClient.cancelQueries({ queryKey: key });
        }
      }
    },
    onSuccess: async (hash: `0x${string}`, variables: Variables) => {
      options.onSent?.(hash);

      if (contractName || options.functionName) {
        txWatcher.watch(hash, options.chainId, {
          contractName,
          functionName: variables.functionName,
        });
      }

      if (options.waitForConfirmation !== false) {
        try {
          const { waitForTransactionReceipt } = await import("@wagmi/core");
          const receipt = await waitForTransactionReceipt(config, {
            hash,
            confirmations: options.confirmations ?? 1,
          });

          options.onConfirmed?.(receipt);

          if (options.invalidateKeys) {
            for (const key of options.invalidateKeys) {
              queryClient.invalidateQueries({ queryKey: key });
            }
          }
        } catch (error) {
          options.onError?.(error as Error);
        }
      } else if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  }));
}
