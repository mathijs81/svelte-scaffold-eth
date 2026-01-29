<script lang="ts">
import type { ContractName } from "$lib/contracts/deployedContracts";
import type { WagmiChain } from "$lib/utils/types";
import { getAllDeployedContracts } from "$lib/web3/createDeployedContractInfo.svelte";
import ContractUI from "./ContractUI.svelte";
import NoContractsAlert from "./NoContractsAlert.svelte";

interface Props {
  chainId: WagmiChain;
}

let { chainId }: Props = $props();

const contracts = $derived(getAllDeployedContracts(chainId));
const contractNames = $derived(Object.keys(contracts) as ContractName[]);
</script>

{#if contractNames.length === 0}
  <NoContractsAlert {chainId} />
{:else}
  <div class="grid grid-cols-1 gap-6">
    {#each contractNames as contractName (contractName)}
      <ContractUI {contractName} {chainId} />
    {/each}
  </div>
{/if}