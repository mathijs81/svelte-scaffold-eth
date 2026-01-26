<script lang="ts">
import WarningIcon from "phosphor-svelte/lib/Warning";
import { createAccount } from "$lib/web3";

const account = createAccount();
</script>

{#if !account.isConnected}
  <div class="alert alert-warning">
    <WarningIcon class="shrink-0 h-6 w-6" />
    <span>Please connect your wallet to interact with contracts</span>
  </div>
{/if}