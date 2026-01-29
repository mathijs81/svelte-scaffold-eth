<script lang="ts">
import type { WagmiChain } from "$lib/utils/types";
import { getTransactionUrl } from "$lib/web3/utils";
import { txWatcher } from "$lib/web3/txWatcher.svelte";

interface Props {
  hash: `0x${string}`;
  chainId: WagmiChain;
  onDismiss?: () => void;
}

let { hash, chainId, onDismiss }: Props = $props();

const state = $derived(txWatcher.getTransaction(hash));
const status = $derived(state?.status);

const alertClass = $derived.by(() => {
  switch (status) {
    case "pending":
      return "alert-info";
    case "confirmed":
      return "alert-success";
    case "failed":
      return "alert-error";
    default:
      return "";
  }
});

const statusLabel = $derived.by(() => {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "failed":
      return "Failed";
    case undefined:
      return "Unknown transaction hash";
    default:
      return "";
  }
});

const explorerUrl = $derived(hash ? getTransactionUrl(hash, chainId) : null);
</script>

{#if hash && state !== undefined}
  <div class="alert {alertClass}">
    <div class="flex flex-col gap-1 flex-1">
      <div class="flex items-center gap-2">
        <span class="font-semibold">Transaction Status:</span>
        <span class="badge badge-sm">
          {statusLabel}
        </span>
        {#if status === "pending"}
          <span class="loading loading-spinner loading-xs"></span>
        {/if}
      </div>
      <div class="flex items-center gap-1 flex-wrap">
        <span class="text-sm">Hash:</span>
        <code class="text-xs">{hash}</code>
        {#if explorerUrl}
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="link link-primary text-xs"
          >
            View on Explorer ↗
          </a>
        {/if}
      </div>
      {#if state?.error}
        <div class="text-sm">
          <span class="font-semibold">Error:</span>
          <span>{state?.error.message}</span>
        </div>
      {:else if status === "failed"}
        <div class="text-sm">
          <span>The transaction failed.</span>
        </div>
      {/if}
    </div>
    {#if onDismiss}
      <button class="btn btn-sm btn-ghost" onclick={onDismiss}>✕</button>
    {/if}
  </div>
{/if}
