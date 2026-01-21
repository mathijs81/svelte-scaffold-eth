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

class NetworkInfoData {
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
      console.error("Error fetching network info:", error);
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

let networkInfoData: NetworkInfoData | undefined;

/**
 * Reactive utility to watch network information and account balance.
 *
 * Returned values contains:
 * - blockNumber: Current block number
 * - blockTimestamp: Current block timestamp
 * - chainId: Current chain ID
 * - chainName: Current chain name
 * - balance: Account balance (if account is connected)
 * - balanceCurrency: Balance currency symbol (if account is connected)
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const network = createNetworkInfo();
 * </script>
 *
 * {#if network.chainName}
 *   <p>Connected to {network.chainName}</p>
 *   <p>Block: {network.blockNumber}</p>
 * {/if}
 * ```
 */
export function createNetworkInfo() {
  if (!networkInfoData) {
    networkInfoData = new NetworkInfoData();
    networkInfoData.startUpdates();
  }
  return networkInfoData;
}
