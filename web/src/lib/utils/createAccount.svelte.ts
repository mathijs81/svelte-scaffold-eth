import { getAccount, watchAccount } from "@wagmi/core";
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

  // Return reactive state
  return {
    get address() {
      return address;
    },
    get isConnected() {
      return isConnected;
    },
    get chainId() {
      return chainId;
    },
    get status() {
      return status;
    },
  };
}
