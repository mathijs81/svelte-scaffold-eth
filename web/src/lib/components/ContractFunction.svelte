<script lang="ts">
import AddressInput from "$lib/components/inputs/AddressInput.svelte";
import IntegerInput from "$lib/components/inputs/IntegerInput.svelte";
import StringInput from "$lib/components/inputs/StringInput.svelte";
import { useContractRead, useContractWrite } from "$lib/query";
import type { ContractName, DeployedChains } from "$lib/utils/types";
import { getTransactionUrl } from "$lib/web3";
import type { AbiFunction } from "viem";

interface Props {
  contractName: ContractName<DeployedChains>;
  chainId: DeployedChains;
  functionAbi: AbiFunction;
  isReadFunction: boolean;
}

let { contractName, chainId, functionAbi, isReadFunction }: Props = $props();

// State for function inputs
let inputValues = $state.raw({} as Record<string, string>);

// Initialize input values for each parameter
$effect(() => {
  const initial: Record<string, string> = {};
  functionAbi.inputs?.forEach((input, index) => {
    const key = input.name || `arg${index}`;
    if (inputValues[key] === undefined) {
      initial[key] = "";
    }
  });
  if (Object.keys(initial).length > 0) {
    inputValues = { ...initial, ...inputValues };
  }
});

// For reads: track whether user has triggered a read and what args to use
let readTriggered = $state(false);
let readArgs = $state<readonly unknown[]>([]);

// Create read query (enabled only when triggered)
const readQuery = $derived(
  isReadFunction
    ? useContractRead({
        contract: contractName,
        functionName: functionAbi.name,
        args: readArgs,
        chainId,
        watch: "manual",
        enabled: readTriggered,
      })
    : null,
);

// For writes: create mutation upfront
const writeMutation = $derived(
  !isReadFunction
    ? useContractWrite({
        contract: contractName,
        functionName: functionAbi.name,
        chainId: chainId,
        invalidateKeys: [["readContract"]],
      })
    : null,
);

function handleRead() {
  const args =
    functionAbi.inputs?.map((input, index) => {
      const key = input.name || `arg${index}`;
      const value = inputValues[key];
      return parseInputValue(value, input.type);
    }) || [];

  readArgs = args;
  readTriggered = true;
  readQuery?.refetch();
}

function handleWrite() {
  if (!writeMutation) return;

  const args =
    functionAbi.inputs?.map((input, index) => {
      const key = input.name || `arg${index}`;
      const value = inputValues[key];
      return parseInputValue(value, input.type);
    }) || [];

  writeMutation.mutate({ args });
}

function parseInputValue(value: string, type: string): unknown {
  if (!value) return undefined;

  // Handle uint/int types
  if (type.startsWith("uint") || type.startsWith("int")) {
    return BigInt(value);
  }

  // Handle boolean
  if (type === "bool") {
    return value === "true" || value === "1";
  }

  // Handle address
  if (type === "address") {
    return value as `0x${string}`;
  }

  // Handle bytes
  if (type.startsWith("bytes")) {
    return value as `0x${string}`;
  }

  // Default: return as string
  return value;
}

function getInputComponent(type: string) {
  if (type.startsWith("uint") || type.startsWith("int")) {
    return IntegerInput;
  }
  if (type === "address") {
    return AddressInput;
  }
  // Default to string input
  return StringInput;
}

let isExpanded = $state(false);
</script>

<div class="collapse collapse-arrow bg-base-200">
	<input type="checkbox" bind:checked={isExpanded} />
	<div class="collapse-title text-xl font-medium">
		<div class="flex items-center gap-2">
			<span>{functionAbi.name}</span>
			{#if functionAbi.stateMutability === 'payable'}
				<div class="badge badge-warning">payable</div>
			{/if}
		</div>
	</div>
	<div class="collapse-content">
		<div class="space-y-4">
			<!-- Function inputs -->
			{#if functionAbi.inputs && functionAbi.inputs.length > 0}
				<div class="space-y-2">
					{#each functionAbi.inputs as input, index}
						{@const key = input.name || `arg${index}`}
						{@const Component = getInputComponent(input.type)}
						<div class="form-control">
							<div class="label">
								<span class="label-text">{input.name || `arg${index}`}</span>
								<span class="label-text-alt">{input.type}</span>
							</div>
							<Component
								value={inputValues[key]}
								onInput={(value) => {
									inputValues[key] = value;
								}}
								placeholder={input.type}
							/>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Action button -->
			<div class="flex gap-2">
				{#if isReadFunction}
					<button class="btn btn-primary" onclick={handleRead} disabled={readQuery?.isFetching}>
						{readQuery?.isFetching ? 'Reading...' : 'Read'}
					</button>
				{:else if writeMutation}
					<button
						class="btn btn-primary"
						onclick={handleWrite}
						disabled={writeMutation.isPending}
					>
						{#if writeMutation.isPending}
							Sending transaction...
						{:else}
							Write
						{/if}
					</button>
				{/if}
			</div>

			<!-- Results -->
			{#if isReadFunction && readQuery && readTriggered}
				<div class="divider">Result</div>
				{#if readQuery.isFetching}
					<div class="loading loading-spinner loading-sm"></div>
				{:else if readQuery.error}
					<div class="alert alert-error">
						<span>{readQuery.error.message}</span>
					</div>
				{:else if readQuery.data !== undefined}
					<div class="mockup-code">
						<pre><code>{JSON.stringify(readQuery.data, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2)}</code></pre>
					</div>
				{/if}
			{/if}

			{#if !isReadFunction && writeMutation}
				{#if writeMutation.error}
					<div class="divider">Error</div>
					<div class="alert alert-error">
						<span>{writeMutation.error.message}</span>
					</div>
				{:else if writeMutation.data}
					<div class="divider">Transaction</div>
					<div class="alert alert-info">
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<span>Status:</span>
								<span class="badge badge-info">Sent</span>
							</div>
							<div class="flex items-center gap-1 flex-wrap">
								<span>Hash:</span>
								<code class="text-xs">{writeMutation.data as string}</code>
								{#if getTransactionUrl(writeMutation.data, chainId)}
									<a
										href={getTransactionUrl(writeMutation.data, chainId)}
										target="_blank"
										rel="noopener noreferrer"
										class="link link-primary text-xs"
									>
										View on Explorer ↗
									</a>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
