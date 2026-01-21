import {
  getAccount,
  reconnect,
  watchAccount,
} from "@wagmi/core";
import { getTargetNetwork } from "$lib/wagmi/chains";
import { config } from "$lib/wagmi/config";

class AccountData {
  address = $state<string | undefined>(undefined);
  isConnected = $state(false);
  chainId = $state<number | undefined>(undefined);
  status = $state<"connecting" | "connected" | "disconnected" | "reconnecting">(
    "disconnected",
  );

  // Derived property to check if connected to wrong chain
  isWrongChain = $derived.by(() => {
    const targetNetwork = getTargetNetwork();
    return this.isConnected && this.chainId !== targetNetwork.id;
  });

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
    // Automatically reconnect to previously connected wallet on app initialization
    reconnect(config);
  }
  return accountData;
}
