<script lang="ts">
import AddressInput from "$lib/components/inputs/AddressInput.svelte";
import IntegerInput from "$lib/components/inputs/IntegerInput.svelte";
import StringInput from "$lib/components/inputs/StringInput.svelte";
import TransactionStatus from "$lib/components/TransactionStatus.svelte";
import { useContractRead } from "$lib/query/contractReads.svelte";
import { useContractWrite } from "$lib/query/contractWrites.svelte";
import type { ContractName, WagmiChain } from "$lib/utils/types";
import type { AbiFunction } from "viem";

interface Props {
  contractName: ContractName;
  chainId: WagmiChain;
  functionAbi: AbiFunction;
  isReadFunction: boolean;
}

let { contractName, chainId, functionAbi, isReadFunction }: Props = $props();

const inputKeys = $derived(
  functionAbi.inputs?.map((input, index) => ({
    key: input.name || `arg${index}`,
    type: input.type,
  })) ?? [],
);

const inputKeysSignature = $derived(inputKeys.map(({ key }) => key).join(","));

let inputValues = $state.raw({} as Record<string, string>);
let initializedForSignature = $state("");

$effect(() => {
  if (initializedForSignature !== inputKeysSignature) {
    initializedForSignature = inputKeysSignature;
    const newValues: Record<string, string> = {};
    for (const { key } of inputKeys) {
      newValues[key] = "";
    }
    inputValues = newValues;
  }
});

let readTriggered = $state(false);
let readArgs = $state<readonly unknown[]>([]);

const readQuery = $derived(
  isReadFunction
    ? useContractRead({
        contract: contractName,
        functionName: functionAbi.name,
        args: readArgs,
        chainId,
        watch: false,
        enabled: readTriggered,
      })
    : null,
);

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

  if (type.startsWith("uint") || type.startsWith("int")) {
    return BigInt(value);
  }

  if (type === "bool") {
    return value === "true" || value === "1";
  }

  if (type === "address") {
    return value as `0x${string}`;
  }

  if (type.startsWith("bytes")) {
    return value as `0x${string}`;
  }

  return value;
}

function getInputComponent(type: string) {
  if (type.startsWith("uint") || type.startsWith("int")) {
    return IntegerInput;
  }
  if (type === "address") {
    return AddressInput;
  }
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
			{#if functionAbi.inputs && functionAbi.inputs.length > 0}
				<div class="space-y-2">
					{#each functionAbi.inputs as input, index (input.name || `arg${index}`)}
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
					<TransactionStatus hash={writeMutation.data} {chainId} />
				{/if}
			{/if}
		</div>
	</div>
</div>
