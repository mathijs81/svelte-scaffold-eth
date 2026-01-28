import { getConnection, reconnect, watchConnection } from "@wagmi/core";
import { getTargetNetwork, targetChainId } from "$lib/wagmi/chains";
import { config } from "$lib/wagmi/config";
import type { WagmiChain } from "$lib/utils/types";

class ConnectionData {
  address = $state<string | undefined>(undefined);
  isConnected = $state(false);
  chainId = $state<WagmiChain>(targetChainId);
  status = $state<"connecting" | "connected" | "disconnected" | "reconnecting">(
    "disconnected",
  );

  // Derived property to check if connected to wrong chain
  isWrongChain = $derived.by(() => {
    const targetNetwork = getTargetNetwork();
    return this.isConnected && this.chainId !== targetNetwork.id;
  });

  constructor() {
    const initialConnection = getConnection(config);
    this.address = initialConnection.address;
    this.isConnected = initialConnection.isConnected;
    this.chainId = (initialConnection.chainId as WagmiChain) ?? targetChainId;
    this.status = initialConnection.status;
  }

  startUpdates() {
    const data = this;
    const unwatch = watchConnection(config, {
      onChange(connection) {
        data.address = connection.address;
        data.isConnected = connection.isConnected;
        data.chainId = (connection.chainId as WagmiChain) ?? targetChainId;
        data.status = connection.status;
      },
    });
    return unwatch;
  }
}

let connectionData: ConnectionData | undefined;

/**
 * Reactive utility to watch the connected wallet connection
 *
 * @returns Reactive state with connection address, connection status, and chain ID
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const connection = createConnection();
 * </script>
 *
 * {#if connection.isConnected}
 *   <p>Connected: {connection.address}</p>
 * {:else}
 *   <p>Not connected</p>
 * {/if}
 * ```
 */
export function createConnection() {
  if (!connectionData) {
    connectionData = new ConnectionData();
    connectionData.startUpdates();
    // Automatically reconnect to previously connected wallet on app initialization
    reconnect(config);
  }
  return connectionData;
}

export function resetConnectionForTest() {
  connectionData = undefined;
}
