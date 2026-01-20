<script lang="ts">
import { createDeployedContractInfo } from "$lib/utils";
import type {
  ContractName,
  ChainId,
} from "$lib/utils/createDeployedContractInfo.svelte";
import ContractFunction from "./ContractFunction.svelte";
import type { AbiFunction } from "viem";

interface Props {
  contractName: ContractName<ChainId>;
  chainId: ChainId;
}

let { contractName, chainId }: Props = $props();

// Contract info is initialized once with prop values
// These props define the component identity and won't change during its lifetime
const contractInfo = $derived(
  createDeployedContractInfo(contractName, chainId),
);

$effect(() => {
  if (!contractInfo) {
    console.error(`Contract ${contractName} not found on chain ${chainId}`);
  }
});

// Separate read and write functions from the ABI
const readFunctions = $derived(
  contractInfo?.abi.filter(
    (item): item is AbiFunction =>
      item.type === "function" &&
      (item.stateMutability === "view" || item.stateMutability === "pure"),
  ) || [],
);

const writeFunctions = $derived(
  contractInfo?.abi.filter(
    (item): item is AbiFunction =>
      item.type === "function" &&
      item.stateMutability !== "view" &&
      item.stateMutability !== "pure",
  ) || [],
);

let activeTab = $state<"read" | "write">("read");
</script>

{#if contractInfo}
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl">
				{contractName}
				<div class="badge badge-secondary">
					{contractInfo.address.slice(0, 6)}...{contractInfo.address.slice(-4)}
				</div>
			</h2>

			<div class="tabs tabs-boxed">
				<button
					class="tab"
					class:tab-active={activeTab === 'read'}
					onclick={() => activeTab = 'read'}
				>
					Read ({readFunctions.length})
				</button>
				<button
					class="tab"
					class:tab-active={activeTab === 'write'}
					onclick={() => activeTab = 'write'}
				>
					Write ({writeFunctions.length})
				</button>
			</div>

			<div class="divider"></div>

			<div class="space-y-4">
				{#if activeTab === 'read'}
					{#if readFunctions.length === 0}
						<p class="text-base-content/70">No read functions available</p>
					{:else}
						{#each readFunctions as func (func.name)}
							<ContractFunction
								{contractName}
								{chainId}
								functionAbi={func}
								isReadFunction={true}
							/>
						{/each}
					{/if}
				{:else}
					{#if writeFunctions.length === 0}
						<p class="text-base-content/70">No write functions available</p>
					{:else}
						{#each writeFunctions as func (func.name)}
							<ContractFunction
								{contractName}
								{chainId}
								functionAbi={func}
								isReadFunction={false}
							/>
						{/each}
					{/if}
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="alert alert-error">
		<span>Contract {contractName} not found on chain {chainId}</span>
	</div>
{/if}
