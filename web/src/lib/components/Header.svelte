<script lang="ts">
import { page } from "$app/state";
import { useBalance, useBlockNumber } from "$lib/query/networkInfo.svelte";
import { config } from "$lib/wagmi/config";
import { createConnection } from "$lib/web3/createConnection.svelte";
import { connect, disconnect } from "@wagmi/core";
import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";
import NetworkMismatchAlert from "./NetworkMismatchAlert.svelte";

const connection = createConnection();

const balance = useBalance(connection.address as `0x${string}` | undefined, {
  watch: true,
});
const blockNumber = useBlockNumber({ watch: true });

const chainName = $derived(
  config.chains.find((chain) => chain.id === connection.chainId)?.name ??
    "Unsupported chain",
);

let connectError = $state<string | null>(null);
let isConnecting = $state(false);

async function connectWallet() {
  if (isConnecting) return;

  connectError = null;
  isConnecting = true;
  try {
    // TODO: implement modal to choose connector in case of multiple connectors?
    await connect(config, { connector: config.connectors[0] });
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

const baseDestinations = [
  ["Debug", "/debug"],
  // Add your other destinations here
] as const;

const destinations = $derived(
  baseDestinations.map(([name, href]) => [
    name,
    href,
    page.url.pathname?.startsWith(href) ?? false,
  ]),
) as [string, string, boolean][];
</script>

<div class="navbar bg-base-100 shadow-lg">
  <div>
    <a href="/" class="btn btn-ghost text-xl">Svelte Scaffold ETH</a>
  </div>
  <div class="flex gap-3 flex-1">
    {#each destinations as [name, href, active] (name)}
      <a href={href} class="btn btn-ghost" class:btn-active={active}>{name}</a>
    {/each}
  </div>
  <div class="flex gap-3 items-baseline">
    {#if chainName}
      <div class="flex items-baseline gap-1.5 text-sm">
        <span class="opacity-70">{chainName}</span>
        <span class="font-mono text-xs opacity-50">
          #{blockNumber.data ? blockNumber.data.toLocaleString() : '...'}
        </span>
      </div>
    {/if}
    {#if connection.isConnected}
      <div class="dropdown dropdown-end">
        <button type="button" tabindex="0" class="btn btn-sm bg-base-200 hover:bg-base-300 h-fit py-1">
          {#if balance.data}
            <span class="opacity-70 text-xs">
              {(Number(balance.data.value) / 10 ** balance.data.decimals).toFixed(3)} {balance.data.symbol}
            </span>
          {/if}
          <span class="font-mono">{connection.address?.slice(0, 6)}...{connection.address?.slice(-4)}</span>
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

<NetworkMismatchAlert />

{#if connectError}
  <div class="alert alert-error mx-4 mt-2">
    <XCircleIcon class="shrink-0 h-6 w-6" />
    <span>{connectError}</span>
  </div>
{/if}
