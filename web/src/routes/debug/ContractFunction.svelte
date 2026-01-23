<script lang="ts">
import {
  createReadContract,
  createWriteContract,
  getTransactionUrl,
} from "$lib/web3";
import StringInput from "$lib/components/inputs/StringInput.svelte";
import IntegerInput from "$lib/components/inputs/IntegerInput.svelte";
import AddressInput from "$lib/components/inputs/AddressInput.svelte";
import type { AbiFunction, AbiParameter } from "viem";
import type {
  ChainId,
  ContractName,
} from "$lib/web3/createDeployedContractInfo.svelte";

interface Props {
  contractName: ContractName<ChainId>;
  chainId: ChainId;
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

let readResult = $state<ReturnType<typeof createReadContract> | null>(null);

// Initialized once with props - component identity won't change during its lifetime
// Transaction lifecycle managed by txWatcher, toasts by TransactionToastHandler
// svelte-ignore state_referenced_locally
const writer = !isReadFunction
  ? createWriteContract({
      contractName,
      functionName: functionAbi.name,
      chainId,
    })
  : null;

function handleRead() {
  // Parse input values to appropriate types
  const args =
    functionAbi.inputs?.map((input, index) => {
      const key = input.name || `arg${index}`;
      const value = inputValues[key];
      return parseInputValue(value, input.type);
    }) || [];

  // Create read contract with parsed args
  readResult = createReadContract({
    contractName,
    functionName: functionAbi.name,
    args,
    chainId,
  });
}

async function handleWrite() {
  if (!writer) return;

  // Parse input values to appropriate types
  const args =
    functionAbi.inputs?.map((input, index) => {
      const key = input.name || `arg${index}`;
      const value = inputValues[key];
      return parseInputValue(value, input.type);
    }) || [];

  await writer.write(args);
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
					<button class="btn btn-primary" onclick={handleRead}>Read</button>
				{:else}
					<button
						class="btn btn-primary"
						onclick={handleWrite}
						disabled={writer?.isPending || writer?.txState?.status === 'confirming'}
					>
						{#if writer?.isPending}
							Waiting for approval...
						{:else if writer?.txState?.status === 'confirming'}
							Confirming...
						{:else if writer?.txState?.status === 'confirmed'}
							Confirmed! ✓
						{:else}
							Write
						{/if}
					</button>
				{/if}
			</div>

			<!-- Results -->
			{#if isReadFunction && readResult}
				<div class="divider">Result</div>
				{#if readResult.isLoading}
					<div class="loading loading-spinner loading-sm"></div>
				{:else if readResult.error}
					<div class="alert alert-error">
						<span>{readResult.error.message}</span>
					</div>
				{:else if readResult.data !== undefined}
					<div class="mockup-code">
						<pre><code>{JSON.stringify(readResult.data, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2)}</code></pre>
					</div>
				{/if}
			{/if}

			{#if !isReadFunction && writer}
				{#if writer.error}
					<div class="divider">Error</div>
					<div class="alert alert-error">
						<span>{writer.error.message}</span>
					</div>
				{:else if writer.hash && writer.txState}
					<div class="divider">Transaction</div>
					<div class="alert" class:alert-info={writer.txState.status === 'confirming'} class:alert-success={writer.txState.status === 'confirmed'} class:alert-error={writer.txState.status === 'failed'}>
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<span>Status:</span>
								<span class="badge" class:badge-info={writer.txState.status === 'confirming'} class:badge-success={writer.txState.status === 'confirmed'} class:badge-error={writer.txState.status === 'failed'}>
									{writer.txState.status}
								</span>
							</div>
							<div class="flex items-center gap-1 flex-wrap">
								<span>Hash:</span>
								<code class="text-xs">{writer.hash}</code>
								{#if getTransactionUrl(writer.hash, writer.txState.chainId)}
									<a
										href={getTransactionUrl(writer.hash, writer.txState.chainId)}
										target="_blank"
										rel="noopener noreferrer"
										class="link link-primary text-xs"
									>
										View on Explorer ↗
									</a>
								{/if}
							</div>
							{#if writer.txState.error}
								<div class="text-error text-sm mt-1">
									{writer.txState.error.message}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
