<script lang="ts">
import deployedContracts from "$lib/contracts/deployedContracts";
import ContractList from "$lib/components/ContractList.svelte";
import WalletWarning from "$lib/components/WalletWarning.svelte";
import NoContractsAlert from "$lib/components/NoContractsAlert.svelte";
import type { ContractName, DeployedChains } from "$lib/utils/types";

const chainId = 31337;
const contracts = $derived(deployedContracts[chainId] || {});
const contractNames = $derived(
  Object.keys(contracts) as ContractName<DeployedChains>[],
);
</script>

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

    <WalletWarning />

    {#if contractNames.length === 0}
      <NoContractsAlert {chainId} />
    {:else}
      <ContractList {chainId} />
    {/if}
  </div>
</div>
