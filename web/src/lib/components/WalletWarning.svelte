<script lang="ts">
import WarningIcon from "phosphor-svelte/lib/WarningIcon";
import { createConnection } from "$lib/web3/createConnection.svelte";

const connection = createConnection();
</script>

{#if !connection.isConnected}
  <div class="alert alert-warning">
    <WarningIcon class="shrink-0 h-6 w-6" />
    <span>Please connect your wallet to interact with contracts</span>
  </div>
{/if}