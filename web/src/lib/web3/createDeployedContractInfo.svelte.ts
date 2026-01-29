import {
  deployedContracts,
  type ContractInfo,
  type ContractName,
} from "$lib/contracts/deployedContracts";
import type { WagmiChain } from "$lib/utils/types";
import type { Abi } from "abitype";

export interface DeployedContractInfo {
  address: `0x${string}`;
  abi: Abi;
}

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
  contractName: ContractName,
  chainId: WagmiChain,
): DeployedContractInfo | null {
  const contractInfo: ContractInfo | undefined =
    deployedContracts[contractName];
  if (!contractInfo) {
    return null;
  }

  const contractAddress = contractInfo.deployments[chainId];
  if (!contractAddress) {
    return null;
  }

  return {
    address: contractAddress,
    abi: contractInfo.abi,
  };
}

/**
 * Get all deployed contracts for a specific chain
 *
 * @param chainId - Chain ID to get contracts from
 * @returns Object with the contract names for that chain
 */
export function getAllDeployedContracts(
  chainId: WagmiChain,
): Record<ContractName, ContractInfo> {
  return Object.fromEntries(
    Object.entries(deployedContracts).filter(
      ([_, info]) => info.deployments[chainId],
    ),
  );
}
