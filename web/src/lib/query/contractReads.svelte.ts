import type { WagmiChain } from "$lib/utils/types";
import { config } from "$lib/wagmi/config";
import { createDeployedContractInfo } from "$lib/web3/createDeployedContractInfo.svelte";
import { createQuery } from "@tanstack/svelte-query";
import { readContractQueryOptions } from "@wagmi/core/query";
import type { Abi } from "viem";
import { getGlobalClient } from "./globalClient";
import type { ContractName } from "$lib/contracts/deployedContracts";
import { DEFAULT_WATCH_INTERVAL } from "./config";

export interface UseContractReadOptions {
  contract: `0x${string}` | ContractName;
  abi?: Abi;
  functionName: string;
  args?: readonly unknown[];
  chainId: WagmiChain;
  /**
   * Enable polling for this query
   * - false: no polling (default, relies on block watcher)
   * - true: poll at default interval (4s)
   * - number: poll at specific interval in milliseconds
   */
  watch?: boolean | number;
  enabled?: boolean;
  staleTime?: number;
}

export function useContractRead(options: UseContractReadOptions) {
  let contractAddress: `0x${string}`;
  let contractAbi: Abi;
  if (
    typeof options.contract === "string" &&
    options.contract.startsWith("0x")
  ) {
    if (!options.abi) {
      throw new Error("ABI is required when using contract address directly");
    }
    contractAddress = options.contract as `0x${string}`;
    contractAbi = options.abi;
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
  }

  const refetchInterval =
    options.watch === true
      ? DEFAULT_WATCH_INTERVAL
      : typeof options.watch === "number"
        ? options.watch
        : false;

  return createQuery(
    () =>
      readContractQueryOptions(config, {
        address: contractAddress,
        abi: contractAbi,
        functionName: options.functionName,
        args: options.args,
        chainId: options.chainId,
        query: {
          enabled: options.enabled ?? true,
          refetchInterval,
          staleTime: options.staleTime,
        },
      }),
    getGlobalClient(),
  );
}
