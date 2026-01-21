<script lang="ts">
import InfoIcon from "phosphor-svelte/lib/Info";
import WarningIcon from "phosphor-svelte/lib/Warning";
import deployedContracts from "$lib/contracts/deployedContracts";
import { createAccount } from "$lib/web3";
import type {
  ChainId,
  ContractName,
} from "$lib/web3/createDeployedContractInfo.svelte";
import ContractUI from "./ContractUI.svelte";

const account = createAccount();

const chainId = 31337 as unknown as ChainId;
const contracts = $derived(deployedContracts[chainId] || {});
const contractNames = $derived(
  Object.keys(contracts) as ContractName<ChainId>[],
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

    {#if !account.isConnected}
      <div class="alert alert-warning">
        <WarningIcon class="shrink-0 h-6 w-6" />
        <span>Please connect your wallet to interact with contracts</span>
      </div>
    {/if}

    {#if contractNames.length === 0}
      <div class="alert alert-info">
        <InfoIcon class="shrink-0 w-6 h-6" />
        <span>No contracts deployed on chain {chainId}. Run `pnpm -C foundry deploy:anvil` to deploy contracts.</span>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6">
        {#each contractNames as contractName (contractName)}
          <ContractUI {contractName} {chainId} />
        {/each}
      </div>
    {/if}
  </div>
</div>
