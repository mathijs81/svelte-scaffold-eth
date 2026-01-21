<script lang="ts">
import deployedContracts from "$lib/contracts/deployedContracts";
import { createAccount, formatAddress } from "$lib/utils";
import ContractUI from "./ContractUI.svelte";
import { connect, disconnect } from "@wagmi/core";
import { config } from "$lib/wagmi/config";
import { injected } from "@wagmi/connectors";
import XCircleIcon from "phosphor-svelte/lib/XCircle";
import WarningIcon from "phosphor-svelte/lib/Warning";
import InfoIcon from "phosphor-svelte/lib/Info";
import type {
  ChainId,
  ContractName,
} from "$lib/utils/createDeployedContractInfo.svelte";

const account = createAccount();

// Get all deployed contracts for the current chain (31337 = foundry)
// FIXME add chain chooser
const chainId = 31337 as ChainId;
const contracts = $derived(deployedContracts[chainId] || {});
const contractNames = $derived(
  Object.keys(contracts) as ContractName<ChainId>[],
);

let connectError = $state<string | null>(null);
let isConnecting = $state(false);

async function connectWallet() {
  if (isConnecting) return;

  connectError = null;
  isConnecting = true;
  try {
    // Check if there's an injected provider
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

<div class="min-h-screen bg-base-200">
	<!-- Header -->
	<div class="navbar bg-base-100 shadow-lg">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost text-xl">Svelte Scaffold ETH</a>
		</div>
		<div class="flex-none gap-2">
			{#if account.isConnected}
				<div class="dropdown dropdown-end">
					<button type="button" class="btn btn-ghost">
						{formatAddress(account.address)}
					</button>
					<ul class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
						<li><button onclick={disconnectWallet}>Disconnect</button></li>
					</ul>
				</div>
			{:else}
				<button class="btn btn-primary" onclick={connectWallet} disabled={isConnecting}>
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

	<!-- Main Content -->
	<div class="container mx-auto p-4">
		<div class="flex flex-col gap-4">
			<div>
				<h1 class="text-4xl font-bold">
					Debug Contracts {contractNames.length > 0 ? `(${contractNames.length})` : ""}
				</h1>
				<p class="text-base-content/70 mt-2">
					Interactive UI to test all deployed contract functions
				</p>
			</div>

			{#if !account.isConnected}
				<div class="alert alert-warning">
					<WarningIcon class="shrink-0 h-6 w-6" />
					<span>Please connect your wallet to interact with contracts</span>
				</div>
			{/if}

			{#if contractNames.length === 0}
				<div class="alert alert-info">
					<InfoIcon class="shrink-0 w-6 h-6" />
					<span>No contracts deployed on chain {chainId}. Run `pnpm -C foundry deploy:anvil` to deploy contracts.</span>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6">
					{#each contractNames as contractName (contractName)}
						<ContractUI {contractName} {chainId} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
