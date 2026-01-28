import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "$lib/wagmi/config";
import { SvelteMap } from "svelte/reactivity";

export type TxStatus = "pending" | "confirmed" | "failed";

export interface TxState {
  hash: `0x${string}`;
  chainId: number;
  status: TxStatus;
  error?: Error;
  timestamp: number;
  contractName?: string;
  functionName?: string;
}

export type TxEventHandler = (tx: TxState) => void;

const TX_CLEANUP_DELAY = 5 * 60 * 1000;

class TxWatcherService {
  private transactions = new SvelteMap<`0x${string}`, TxState>();
  private cleanupTimeouts = new Map<
    `0x${string}`,
    ReturnType<typeof setTimeout>
  >();
  private eventHandlers = new Set<TxEventHandler>();

  on(handler: TxEventHandler) {
    this.eventHandlers.add(handler);
  }

  off(handler: TxEventHandler) {
    this.eventHandlers.delete(handler);
  }

  private emit(tx: TxState) {
    this.eventHandlers.forEach((handler) => {
      handler(tx);
    });
  }

  async watch(
    hash: `0x${string}`,
    chainId: number,
    metadata?: { contractName?: string; functionName?: string },
  ) {
    if (this.transactions.has(hash)) {
      return;
    }

    const txState: TxState = {
      hash,
      chainId,
      status: "pending",
      timestamp: Date.now(),
      ...metadata,
    };

    this.transactions.set(hash, txState);
    this.emit(txState);

    try {
      await waitForTransactionReceipt(config, {
        hash,
        chainId: chainId as (typeof config)["chains"][number]["id"],
      });

      const tx = this.transactions.get(hash);
      if (tx) {
        const confirmedTx = { ...tx, status: "confirmed" as const };
        this.transactions.set(hash, confirmedTx);
        this.emit(confirmedTx);
        this.scheduleCleanup(hash);
      }
    } catch (error) {
      const tx = this.transactions.get(hash);
      if (tx) {
        const failedTx = {
          ...tx,
          status: "failed" as const,
          error: error instanceof Error ? error : new Error(String(error)),
        };
        this.transactions.set(hash, failedTx);
        this.emit(failedTx);
        this.scheduleCleanup(hash);
      }
    }
  }

  getTransaction(hash: `0x${string}`): TxState | undefined {
    return this.transactions.get(hash);
  }

  get all(): TxState[] {
    return Array.from(this.transactions.values());
  }

  get pending(): TxState[] {
    return this.all.filter((tx) => tx.status === "pending");
  }

  clear(hash: `0x${string}`) {
    this.transactions.delete(hash);
    const timeout = this.cleanupTimeouts.get(hash);
    if (timeout) {
      clearTimeout(timeout);
      this.cleanupTimeouts.delete(hash);
    }
  }

  clearAll() {
    this.transactions.clear();
    for (const timeout of this.cleanupTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.cleanupTimeouts.clear();
  }

  private scheduleCleanup(hash: `0x${string}`) {
    const existingTimeout = this.cleanupTimeouts.get(hash);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      this.clear(hash);
    }, TX_CLEANUP_DELAY);

    this.cleanupTimeouts.set(hash, timeout);
  }
}

/**
 * Global transaction watcher service
 *
 * Tracks transaction lifecycle and emits events when transaction state changes.
 *
 * @example
 * // Watch a transaction
 * txWatcher.watch(hash, chainId, { contractName: 'YourContract', functionName: 'setGreeting' });
 *
 * // Listen for state changes
 * txWatcher.on((tx) => {
 *   switch (tx.status) {
 *     case 'confirming':
 *       console.log('Transaction submitted:', tx.hash);
 *       break;
 *     case 'confirmed':
 *       console.log('Transaction confirmed:', tx.hash);
 *       break;
 *     case 'failed':
 *       console.log('Transaction failed:', tx.error);
 *       break;
 *   }
 * });
 *
 * // Get transaction state
 * const txState = txWatcher.getTransaction(hash);
 */
export const txWatcher = new TxWatcherService();
