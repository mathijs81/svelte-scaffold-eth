<script lang="ts">
import deployedContracts from "$lib/contracts/deployedContracts";
import ContractUI from "./ContractUI.svelte";
import type { ContractName, DeployedChains } from "$lib/utils/types";

interface Props {
  chainId: DeployedChains;
}

let { chainId }: Props = $props();

const contracts = $derived(deployedContracts[chainId] || {});
const contractNames = $derived(
  Object.keys(contracts) as ContractName<DeployedChains>[],
);
</script>

<div class="grid grid-cols-1 gap-6">
  {#each contractNames as contractName (contractName)}
    <ContractUI {contractName} {chainId} />
  {/each}
</div>