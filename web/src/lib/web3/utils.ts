import { chains } from "$lib/wagmi/chains";

// Uses viem's chain configuration
export function getNetworkName(chainId?: number): string | undefined {
  if (!chainId) return undefined;
  const chain = chains.find((c) => c.id === chainId);
  return chain?.name;
}

// Uses viem's chain configuration
export function getExplorerUrl(chainId?: number): string | undefined {
  if (!chainId) return undefined;
  const chain = chains.find((c) => c.id === chainId);
  return chain?.blockExplorers?.default?.url;
}

export function getTransactionUrl(
  txHash: string,
  chainId?: number,
): string | undefined {
  const baseUrl = getExplorerUrl(chainId);
  if (!baseUrl) return undefined;
  return `${baseUrl}/tx/${txHash}`;
}

export function getAddressUrl(
  address: string,
  chainId?: number,
): string | undefined {
  const baseUrl = getExplorerUrl(chainId);
  if (!baseUrl) return undefined;
  return `${baseUrl}/address/${address}`;
}

export function getBlockUrl(
  blockNumber: number | string,
  chainId?: number,
): string | undefined {
  const baseUrl = getExplorerUrl(chainId);
  if (!baseUrl) return undefined;
  return `${baseUrl}/block/${blockNumber}`;
}
