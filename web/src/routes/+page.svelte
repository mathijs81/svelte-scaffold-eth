<script lang="ts">
import { createAccount } from "$lib/utils";
import { connect, disconnect } from "@wagmi/core";
import { config } from "$lib/wagmi/config";
import { injected } from "@wagmi/connectors";
import XCircleIcon from "phosphor-svelte/lib/XCircle";
import CodeIcon from "phosphor-svelte/lib/Code";
import GithubLogoIcon from "phosphor-svelte/lib/GithubLogo";

const account = createAccount();

let connectError = $state<string | null>(null);

async function connectWallet() {
  connectError = null;
  try {
    // Check if there's an injected provider
    if (typeof window === "undefined" || !window.ethereum) {
      connectError =
        "No wallet detected. Please install MetaMask or another Web3 wallet.";
      return;
    }
    await connect(config, { connector: injected() });
  } catch (error: unknown) {
    console.error("Failed to connect wallet:", error);
    connectError =
      error instanceof Error ? error.message : "Failed to connect wallet";
  }
}

async function disconnectWallet() {
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
					<div tabindex="0" role="button" class="btn btn-ghost">
						{account.address?.slice(0, 6)}...{account.address?.slice(-4)}
					</div>
					<ul class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
						<li><button onclick={disconnectWallet}>Disconnect</button></li>
					</ul>
				</div>
			{:else}
				<button class="btn btn-primary" onclick={connectWallet}>Connect Wallet</button>
			{/if}
		</div>
	</div>

	{#if connectError}
		<div class="alert alert-error mx-4 mt-2">
			<XCircleIcon class="shrink-0 h-6 w-6" />
			<span>{connectError}</span>
		</div>
	{/if}

	<!-- Hero Section -->
	<div class="hero min-h-[calc(100vh-4rem)]">
		<div class="hero-content text-center">
			<div class="max-w-3xl">
				<h1 class="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					Svelte Scaffold ETH
				</h1>
				<p class="py-6 text-xl text-base-content/70">
					A modern starter template for building Ethereum dApps with SvelteKit 5, Foundry, and DaisyUI.
				</p>

				<div class="flex flex-wrap gap-4 justify-center">
					<a href="/debug" class="btn btn-primary btn-lg">
						<CodeIcon class="h-6 w-6" />
						Debug Contracts
					</a>
					<a href="https://github.com/mathijs81/svelte-scaffold-eth" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-lg">
						<GithubLogoIcon class="h-6 w-6" />
						Documentation
					</a>
				</div>

				{#if account.isConnected}
					<div class="mt-8">
						<div class="stats shadow">
							<div class="stat">
								<div class="stat-title">Connected Address</div>
								<div class="stat-value text-lg font-mono">{account.address?.slice(0, 10)}...{account.address?.slice(-8)}</div>
								<div class="stat-desc">Chain ID: {account.chainId}</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Features Grid -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title justify-center">⚡️ SvelteKit 5</h2>
							<p>Built with Svelte 5 runes for clean, reactive code</p>
						</div>
					</div>
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title justify-center">🔨 Foundry</h2>
							<p>Blazing-fast smart contract development</p>
						</div>
					</div>
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title justify-center">🎨 DaisyUI</h2>
							<p>Beautiful, themeable components</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
