import {
  getAccount,
  getBalance,
  getBlock,
  getBlockNumber,
  watchAccount,
  watchBlockNumber,
} from "@wagmi/core";
import { chains } from "$lib/wagmi/chains";
import { config } from "$lib/wagmi/config";

/**
 * Reactive utility to watch the connected wallet account
 *
 * @returns Reactive state with account address, connection status, and chain ID
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const account = createAccount();
 * </script>
 *
 * {#if account.isConnected}
 *   <p>Connected: {account.address}</p>
 * {:else}
 *   <p>Not connected</p>
 * {/if}
 * ```
 */
export function createAccount() {
  let address = $state<string | undefined>(undefined);
  let isConnected = $state(false);
  let chainId = $state<number | undefined>(undefined);
  let status = $state<
    "connecting" | "connected" | "disconnected" | "reconnecting"
  >("disconnected");

  // Get initial state
  const initialAccount = getAccount(config);
  address = initialAccount.address;
  isConnected = initialAccount.isConnected;
  chainId = initialAccount.chainId;
  status = initialAccount.status;

  // Watch for changes and cleanup automatically
  $effect(() => {
    const unwatch = watchAccount(config, {
      onChange(account) {
        address = account.address;
        isConnected = account.isConnected;
        chainId = account.chainId;
        status = account.status;
      },
    });

    return unwatch;
  });

  // Return reactive state directly
  return { address, isConnected, chainId, status };
}

/**
 * Reactive utility to watch basic chain stats.
 *
 * Returned values contains:
 * - blockNumber
 * - blockTimestamp
 * - chainId
 * - chainName
 * - balance (if account is connected)
 * - balanceCurrency (if account is connected)
 */
export function createChainStats() {
  let blockNumber = $state<number | undefined>(undefined);
  let blockTimestamp = $state<number | undefined>(undefined);
  let chainId = $state<number | undefined>(undefined);
  let chainName = $state<string | undefined>(undefined);
  let balance = $state<bigint | undefined>(undefined);
  let balanceCurrency = $state<string | undefined>(undefined);

  async function fetchData() {
    try {
      const account = getAccount(config);
      const currentChainId = account.chainId;

      if (!currentChainId) {
        // Reset values if no chain is connected
        blockNumber = undefined;
        blockTimestamp = undefined;
        chainId = undefined;
        chainName = undefined;
        balance = undefined;
        balanceCurrency = undefined;
        return;
      }

      chainId = currentChainId;
      const chainInfo = chains.find((c) => c.id === currentChainId);
      chainName = chainInfo?.name;

      const currentBlockNumber = await getBlockNumber(config, {
        chainId: currentChainId,
      });
      blockNumber = Number(currentBlockNumber);

      const block = await getBlock(config, {
        chainId: currentChainId,
        blockNumber: currentBlockNumber,
      });
      blockTimestamp = Number(block.timestamp);

      if (account.address) {
        const balanceData = await getBalance(config, {
          address: account.address,
          chainId: currentChainId,
        });
        balance = balanceData.value;
        balanceCurrency = balanceData.symbol;
      } else {
        balance = undefined;
        balanceCurrency = undefined;
      }
    } catch (error) {
      console.error("Error fetching chain stats:", error);
    }
  }

  // Initial fetch
  fetchData();

  // Watch for account changes (connect/disconnect/switch account)
  $effect(() => {
    const unwatchAccount = watchAccount(config, {
      onChange: () => fetchData(),
    });

    return unwatchAccount;
  });

  // Watch for new blocks and refetch
  $effect(() => {
    const account = getAccount(config);
    const currentChainId = account.chainId;

    if (!currentChainId) {
      return;
    }

    const unwatchBlock = watchBlockNumber(config, {
      chainId: currentChainId,
      onBlockNumber: () => fetchData(),
    });

    return unwatchBlock;
  });

  return {
    blockNumber,
    blockTimestamp,
    chainId,
    chainName,
    balance,
    balanceCurrency,
  };
}
