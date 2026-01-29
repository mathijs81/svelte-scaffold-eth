<script lang="ts">
import CodeIcon from "phosphor-svelte/lib/CodeIcon";
import GithubLogoIcon from "phosphor-svelte/lib/GithubLogoIcon";
import { createConnection } from "$lib/web3/createConnection.svelte";

const connection = createConnection();
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

      {#if connection.isConnected}
        <div class="mt-8">
          <div class="stats shadow">
            <div class="stat">
              <div class="stat-title">Connected Address</div>
              <div class="stat-value text-lg font-mono">{connection.address?.slice(0, 10)}...{connection.address?.slice(-8)}</div>
              <div class="stat-desc">Chain ID: {connection.chainId}</div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>