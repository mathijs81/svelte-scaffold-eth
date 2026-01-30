<script lang="ts">
import type { ContractName, WagmiChain } from "$lib/utils/types";
import { createDeployedContractInfo } from "$lib/web3/createDeployedContractInfo.svelte";

import ContractFunction from "./ContractFunction.svelte";
import type { AbiFunction } from "viem";
import EventTable from "./EventTable.svelte";
import { formatAddress } from "$lib/utils/format";

interface Props {
  contractName: ContractName;
  chainId: WagmiChain;
}

let { contractName, chainId }: Props = $props();

const contractInfo = $derived(
  createDeployedContractInfo(contractName, chainId),
);

const readFunctions = $derived(
  contractInfo?.abi.filter(
    (item): item is AbiFunction =>
      item.type === "function" &&
      (item.stateMutability === "view" || item.stateMutability === "pure"),
  ) || [],
);

const uniqueFunctionName = (func: AbiFunction) =>
  `${contractName}-${func.name}-${func.inputs?.map((input, index) => input.name || `arg${index}`).join("-") ?? ""}`;

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
					{formatAddress(contractInfo.address)}
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
						{#each readFunctions as func (uniqueFunctionName(func))}
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
						{#each writeFunctions as func (uniqueFunctionName(func))}
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

			<div class="divider"></div>
			<h3 class="text-xl">Events</h3>
			<EventTable {contractInfo} {chainId}/>
		</div>
	</div>
{:else}
	<div class="alert alert-error">
		<span>Contract {contractName} not found on chain {chainId}</span>
	</div>
{/if}
