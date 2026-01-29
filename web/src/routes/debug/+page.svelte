<script lang="ts">
import ContractList from "$lib/components/debug/ContractList.svelte";
import WalletWarning from "$lib/components/WalletWarning.svelte";
import { createConnection } from "$lib/web3/createConnection.svelte";

const connection = createConnection();

const chainId = $derived(connection.chainId);
</script>

<div class="container mx-auto p-4">
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="text-4xl font-bold">
        Debug Contracts
      </h1>
      <p class="text-base-content/70 mt-2">
        Interactive UI to test all deployed contract functions
      </p>
    </div>

    <WalletWarning />

    <ContractList {chainId} />
  </div>
</div>
