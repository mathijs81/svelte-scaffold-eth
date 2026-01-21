// Reactive utilities for Web3 interactions

export { createAccount } from "./createAccount.svelte";
export { createNetworkInfo } from "./createNetworkInfo.svelte";
export { createReadContract } from "./createReadContract.svelte";
export { createWriteContract } from "./createWriteContract.svelte";
export {
  createDeployedContractInfo,
  getAllDeployedContracts,
} from "./createDeployedContractInfo.svelte";

/**
 * Formats an Ethereum address for display by truncating the middle
 * @param address - The Ethereum address to format
 * @returns Formatted address like "0x1234...5678" or empty string if no address
 */
export function formatAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
