import deployedContracts from "$lib/contracts/deployedContracts";
import type { ContractName, DeployedChains } from "$lib/utils/types";
import type { Abi } from "viem";

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
export function createDeployedContractInfo(
  contractName: ContractName<DeployedChains>,
  chainId: DeployedChains,
) {
  const chainData = deployedContracts[chainId];
  if (!chainData) {
    return null;
  }

  const contract = chainData[contractName as keyof typeof chainData];
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
export function getAllDeployedContracts<TChainId extends DeployedChains>(
  chainId: TChainId,
) {
  return deployedContracts[`${chainId}`] || null;
}
