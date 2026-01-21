<script lang="ts">
import { createReadContract, createWriteContract } from "$lib/web3";
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
//let inputValues = $state.raw<Record<string, string>>({});
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

// For read functions, create a reactive read contract
let readResult = $state<ReturnType<typeof createReadContract> | null>(null);

// For write functions, create a write contract (initialized once with prop values)
// These props define the component identity and won't change during its lifetime
// svelte-ignore state_referenced_locally
const writeContract = !isReadFunction
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
  if (!writeContract) return;

  // Parse input values to appropriate types
  const args =
    functionAbi.inputs?.map((input, index) => {
      const key = input.name || `arg${index}`;
      const value = inputValues[key];
      return parseInputValue(value, input.type);
    }) || [];

  await writeContract.writeContract(args);
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
						disabled={writeContract?.isPending || writeContract?.isConfirming}
					>
						{#if writeContract?.isPending}
							Waiting for approval...
						{:else if writeContract?.isConfirming}
							Confirming...
						{:else if writeContract?.isConfirmed}
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

			{#if !isReadFunction && writeContract}
				{#if writeContract.error}
					<div class="divider">Error</div>
					<div class="alert alert-error">
						<span>{writeContract.error.message}</span>
					</div>
				{:else if writeContract.hash}
					<div class="divider">Transaction</div>
					<div class="alert alert-success">
						<div class="flex flex-col gap-1">
							<span>Transaction Hash:</span>
							<code class="text-xs">{writeContract.hash}</code>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
