<script lang="ts">
import CodeIcon from "phosphor-svelte/lib/Code";
import GithubLogoIcon from "phosphor-svelte/lib/GithubLogo";
import { createAccount } from "$lib/web3";

const account = createAccount();
</script>

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
