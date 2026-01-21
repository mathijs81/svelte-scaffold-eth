<script lang="ts">
import { injected } from "@wagmi/connectors";
import { connect, disconnect } from "@wagmi/core";
import XCircleIcon from "phosphor-svelte/lib/XCircle";
import { createAccount, createChainStats } from "$lib/utils";
import { config } from "$lib/wagmi/config";

const account = createAccount();
const chainStats = createChainStats();

let connectError = $state<string | null>(null);
let isConnecting = $state(false);

async function connectWallet() {
  if (isConnecting) return;

  connectError = null;
  isConnecting = true;
  try {
    if (typeof window === "undefined" || !window?.ethereum) {
      connectError =
        "No wallet detected. Please install MetaMask or another Web3 wallet.";
      return;
    }
    await connect(config, { connector: injected() });
  } catch (error: unknown) {
    console.error("Failed to connect wallet:", error);
    connectError =
      error instanceof Error ? error.message : "Failed to connect wallet";
  } finally {
    isConnecting = false;
  }
}

async function disconnectWallet() {
  connectError = null;
  await disconnect(config);
}
</script>

<div class="navbar bg-base-100 shadow-lg">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost text-xl">Svelte Scaffold ETH</a>
  </div>
  <div class="flex gap-3 items-baseline">
    {#if chainStats.chainName}
      <div class="flex items-baseline gap-1.5 text-sm">
        <span class="opacity-70">{chainStats.chainName}</span>
        <span class="font-mono text-xs opacity-50">#{chainStats.blockNumber?.toLocaleString()}</span>
      </div>
    {/if}
    {#if account.isConnected}
      <div class="dropdown dropdown-end">
        <button type="button" tabindex="0" role="button" class="btn btn-sm bg-base-200 hover:bg-base-300 h-fit py-1">
          {#if chainStats.balance !== undefined && chainStats.balanceCurrency}
            <span class="opacity-70 text-xs">{(Number(chainStats.balance) / 1e18).toFixed(3)}</span>
          {/if}
          <span class="font-mono">{account.address?.slice(0, 6)}...{account.address?.slice(-4)}</span>
        </button>
        <ul class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li><button onclick={disconnectWallet}>Disconnect</button></li>
        </ul>
      </div>
    {:else}
      <button class="btn btn-sm btn-primary" onclick={connectWallet} disabled={isConnecting}>
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
    {/if}
  </div>
</div>

{#if connectError}
  <div class="alert alert-error mx-4 mt-2">
    <XCircleIcon class="shrink-0 h-6 w-6" />
    <span>{connectError}</span>
  </div>
{/if}
