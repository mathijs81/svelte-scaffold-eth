import deployedContracts from "$lib/contracts/deployedContracts";
import type { Abi } from "viem";

/**
 * Type helper to extract contract names from deployedContracts
 */
export type DeployedContracts = typeof deployedContracts;
export type ChainId = keyof DeployedContracts;
export type ContractName<TChainId extends ChainId> =
  keyof DeployedContracts[TChainId];

/**
 * Get deployed contract info (address and ABI) for a specific chain
 *
 * @param contractName - Name of the contract
 * @param chainId - Chain ID to get the contract from
 * @returns Object with address and abi, or null if not found
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const contractInfo = createDeployedContractInfo('YourContract', 31337);
 * </script>
 *
 * {#if contractInfo}
 *   <p>Contract at: {contractInfo.address}</p>
 * {/if}
 * ```
 */
export function createDeployedContractInfo<TChainId extends ChainId>(
  contractName: ContractName<TChainId>,
  chainId: TChainId,
) {
  const chainData = deployedContracts[chainId];
  if (!chainData) {
    return null;
  }

  const contract = chainData[contractName as keyof typeof chainData] as any;
  if (!contract) {
    return null;
  }

  return {
    address: contract.address as `0x${string}`,
    abi: contract.abi as Abi,
  };
}

/**
 * Get all deployed contracts for a specific chain
 *
 * @param chainId - Chain ID to get contracts from
 * @returns Object with all contracts for that chain
 */
export function getAllDeployedContracts<TChainId extends ChainId>(
  chainId: TChainId,
) {
  return deployedContracts[chainId] || null;
}
