export { createAccount } from "./createAccount.svelte";
export {
  createDeployedContractInfo,
  getAllDeployedContracts,
} from "./createDeployedContractInfo.svelte";

export { txWatcher } from "./txWatcher.svelte";
export type { TxState, TxStatus } from "./txWatcher.svelte";

export {
  getNetworkName,
  getExplorerUrl,
  getTransactionUrl,
  getAddressUrl,
  getBlockUrl,
} from "./utils";

// Returns "0x1234...5678" format
export function formatAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
