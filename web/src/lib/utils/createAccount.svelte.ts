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

type WagmiChain = typeof config['chains'][number]['id'];

// FIXME: unregistering is not done properly.
// When e.g. switching chains, the app keeps requesting block numbers of the previous chain.

class AccountData {
  address = $state<string | undefined>(undefined);
  isConnected = $state(false);
  chainId = $state<number | undefined>(undefined);
  status = $state<"connecting" | "connected" | "disconnected" | "reconnecting">(
    "disconnected",
  );

  constructor() {
    const initialAccount = getAccount(config);
    this.address = initialAccount.address;
    this.isConnected = initialAccount.isConnected;
    this.chainId = initialAccount.chainId;
    this.status = initialAccount.status;
  }

  startUpdates() {
    const data = this;
    const unwatch = watchAccount(config, {
      onChange(account) {
        data.address = account.address;
        data.isConnected = account.isConnected;
        data.chainId = account.chainId;
        data.status = account.status;
      },
    });
    return unwatch;
  }
}

let accountData: AccountData | undefined;

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
  if (!accountData) {
    accountData = new AccountData();
    accountData.startUpdates();
  }
  return accountData;
}

class ChainStatsData {
  blockNumber = $state<number | undefined>(undefined);
  blockTimestamp = $state<number | undefined>(undefined);
  chainId = $state<number | undefined>(undefined);
  chainName = $state<string | undefined>(undefined);
  balance = $state<bigint | undefined>(undefined);
  balanceCurrency = $state<string | undefined>(undefined);

  private unwatchAccount: (() => void) | undefined;
  private unwatchBlock: (() => void) | undefined;

  constructor() {
    this.fetchData();
  }

  async fetchData() {
    try {
      const account = getAccount(config);
      const currentChainId = account.chainId;

      if (!currentChainId) {
        this.blockNumber = undefined;
        this.blockTimestamp = undefined;
        this.chainId = undefined;
        this.chainName = undefined;
        this.balance = undefined;
        this.balanceCurrency = undefined;
        return;
      }

      this.chainId = currentChainId;
      const chainInfo = chains.find((c) => c.id === currentChainId);
      this.chainName = chainInfo?.name;

      const currentBlockNumber = await getBlockNumber(config, {
        chainId: currentChainId as WagmiChain,
      });
      this.blockNumber = Number(currentBlockNumber);

      const block = await getBlock(config, {
        chainId: currentChainId as WagmiChain,
        blockNumber: currentBlockNumber,
      });
      this.blockTimestamp = Number(block.timestamp);

      if (account.address) {
        const balanceData = await getBalance(config, {
          address: account.address,
          chainId: currentChainId as WagmiChain,
        });
        this.balance = balanceData.value;
        this.balanceCurrency = balanceData.symbol;
      } else {
        this.balance = undefined;
        this.balanceCurrency = undefined;
      }
    } catch (error) {
      console.error("Error fetching chain stats:", error);
    }
  }

  startUpdates() {
    this.unwatchAccount = watchAccount(config, {
      onChange: () => this.fetchData(),
    });

    const account = getAccount(config);
    const currentChainId = account.chainId;

    if (currentChainId) {
      this.unwatchBlock = watchBlockNumber(config, {
        chainId: currentChainId as WagmiChain,
        onBlockNumber: () => this.fetchData(),
      });
    }
  }

  stopUpdates() {
    this.unwatchAccount?.();
    this.unwatchBlock?.();
  }
}

let chainStatsData: ChainStatsData | undefined;

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
  if (!chainStatsData) {
    chainStatsData = new ChainStatsData();
    chainStatsData.startUpdates();
  }
  return chainStatsData;
}
