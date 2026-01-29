import type { WagmiChain } from "$lib/utils/types";
import { config } from "$lib/wagmi/config";
import { createQuery } from "@tanstack/svelte-query";
import { watchContractEvent } from "@wagmi/core";
import { getContractEventsQueryOptions } from "@wagmi/core/query";
import { onMount } from "svelte";
import type {
  Abi,
  BlockTag,
  ContractEventArgs,
  ContractEventName,
  Log,
} from "viem";
import { getGlobalClient } from "./globalClient";

export interface UseContractEventsOptions<TAbi extends Abi> {
  address: `0x${string}`;
  abi: TAbi;
  eventName?: ContractEventName<TAbi>;
  args?: ContractEventArgs<TAbi, ContractEventName<TAbi>>;
  chainId: WagmiChain;
  fromBlock: BlockTag | number;
}

export function useContractEvents<TAbi extends Abi>(
  options: UseContractEventsOptions<TAbi>,
) {
  const client = getGlobalClient();
  const queryOptions = getContractEventsQueryOptions(config, {
    address: options.address,
    abi: options.abi,
    eventName: options.eventName,
    args: options.args,
    chainId: options.chainId,
    fromBlock:
      typeof options.fromBlock === "number"
        ? BigInt(options.fromBlock)
        : options.fromBlock,
    query: {
      refetchInterval: false,
    },
  });

  const newQueryKey = [...queryOptions.queryKey, "realtime"];

  const query = createQuery(
    () => ({
      ...queryOptions,
      queryKey: newQueryKey as unknown as typeof queryOptions.queryKey,
    }),
    client,
  );

  type LogsType = Log<
    bigint,
    number,
    false,
    undefined,
    true,
    TAbi,
    ContractEventName<TAbi>
  >;

  const result = [] as LogsType[];
  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    // React to realtime events after initial query is done.
    $effect(() => {
      if (query.status === "success" && !unsubscribe) {
        result.push(...((query.data ?? []) as LogsType[]));
        unsubscribe = watchContractEvent(config, {
          address: options.address,
          abi: options.abi,
          eventName: options.eventName,
          args: options.args,
          onLogs: (logs) => {
            result.push(...(logs as unknown as LogsType[]));
            client?.().setQueryData(newQueryKey, () => [...result]);
          },
        });
      }
    });

    return () => {
      unsubscribe?.();
    };
  });

  return () => query;
}
