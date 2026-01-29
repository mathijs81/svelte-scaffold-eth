<script lang="ts">
import { useContractEvents } from "$lib/query/contractEvents.svelte";
import { formatAddress, formatBytes32StringHtml } from "$lib/utils/format";
import type { WagmiChain } from "$lib/utils/types";
import { config } from "$lib/wagmi/config";
import type { DeployedContractInfo } from "$lib/web3/createDeployedContractInfo.svelte";
import { watchContractEvent } from "@wagmi/core";
import { createWatchContractEvent } from "@wagmi/core/codegen";
import { getContractEventsQueryKey } from "@wagmi/core/query";
import { onMount, unmount } from "svelte";
import { parseEventLogs, type Log } from "viem";

interface Props {
  contractInfo: DeployedContractInfo;
  chainId: WagmiChain;
}

let { contractInfo, chainId }: Props = $props();

const query = $derived(
  useContractEvents<typeof contractInfo.abi>({
    address: contractInfo.address,
    abi: contractInfo.abi,
    chainId,
    fromBlock: "earliest",
  })(),
);

const events = $derived(query.data ?? []);
const status = $derived(query.status);
const error = $derived(query.error);
</script>


{#if status === "pending"}
    <div>Loading...</div>
{:else if status === "error"}
    <div>Error: {error?.message}</div>
{:else if status === "success" && events && events.length > 0}
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Address</th>
            <th>Event Name</th>
            <th>Args</th>
            <th>Data</th>
            <th>Topics</th>
            <th>Block Number</th>
            <th>Block Hash</th>
            <th>Transaction Hash</th>
            <th>Transaction Index</th>
            <th>Log Index</th>
          </tr>
        </thead>
        <tbody>
          {#each events as event}
            <tr>
              <td>{formatAddress(event.address)}</td>
              <td>{event.eventName}</td>
              <td>{Object.entries(event.args).map(([key, value]) => `${key}: ${value}`).join(", ")}</td>
              <td>{@html formatBytes32StringHtml(event.data)}</td>
              <td>{@html event.topics.map(topic => formatBytes32StringHtml(topic)).join(", ")}</td>
              <td>{event.blockNumber}</td>
              <td>{@html formatBytes32StringHtml(event.blockHash)}</td>
              <td>{@html formatBytes32StringHtml(event.transactionHash)}</td>
              <td>{event.transactionIndex}</td>
              <td>{event.logIndex}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
{:else}
    <div class="alert">
        <span>No events found for contract {formatAddress(contractInfo.address)}</span>
    </div>
{/if}
