<script lang="ts">
import { switchChain } from "@wagmi/core";
import WarningIcon from "phosphor-svelte/lib/Warning";
import { config } from "$lib/wagmi/config";
import { getTargetNetwork } from "$lib/wagmi/chains";
import { createAccount } from "$lib/web3";

const account = createAccount();
const targetNetwork = getTargetNetwork();

let isSwitchingChain = $state(false);
let switchError = $state<string | null>(null);

async function handleSwitchChain() {
  if (isSwitchingChain) return;

  isSwitchingChain = true;
  switchError = null;
  try {
    await switchChain(config, { chainId: targetNetwork.id });
  } catch (error: unknown) {
    console.error("Failed to switch chain:", error);
    switchError =
      error instanceof Error ? error.message : "Failed to switch chain";
  } finally {
    isSwitchingChain = false;
  }
}
</script>

{#if account.isWrongChain}
  <div class="alert alert-warning mx-4 mt-2">
    <WarningIcon class="shrink-0 h-6 w-6" />
    <span>
      You are connected to the wrong network. Please switch to {targetNetwork.name}.
    </span>
    <button
      class="btn btn-sm btn-primary"
      onclick={handleSwitchChain}
      disabled={isSwitchingChain}
    >
      {isSwitchingChain ? "Switching..." : "Switch Network"}
    </button>
  </div>
  {#if switchError}
    <div class="alert alert-error mx-4 mt-2">
      <span>{switchError}</span>
    </div>
  {/if}
{/if}
