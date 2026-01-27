import type { ContractName, DeployedChains } from "$lib/utils/types";
import { config } from "$lib/wagmi/config";
import { createDeployedContractInfo } from "$lib/web3/createDeployedContractInfo.svelte";
import { createQuery } from "@tanstack/svelte-query";
import { readContractQueryOptions } from "@wagmi/core/query";
import type { Abi } from "viem";
import { queryConfig, type UpdateStrategy } from "./config";
import { getGlobalClient } from "./globalClient";

export interface UseContractReadOptions {
  contract: `0x${string}` | ContractName<DeployedChains>;
  abi?: Abi;
  functionName: string;
  args?: readonly unknown[];
  chainId: DeployedChains;
  watch?: UpdateStrategy | boolean;
  interval?: number;
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
      options.contract as ContractName<DeployedChains>,
      options.chainId,
    );
    if (!contract) {
      throw new Error(`Contract ${options.contract} not found`);
    }
    contractAddress = contract.address;
    contractAbi = options.abi || contract.abi;
  }

  const watchStrategy =
    options.watch === undefined
      ? queryConfig.defaultStrategy
      : options.watch === true
        ? "interval"
        : options.watch === false
          ? "manual"
          : options.watch;

  const refetchInterval =
    watchStrategy === "interval"
      ? (options.interval ?? queryConfig.defaultInterval)
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
