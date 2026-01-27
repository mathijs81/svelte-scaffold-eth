import { createTestClient, http, publicActions, walletActions } from "viem";
import { foundry } from "viem/chains";
import type { TestClient } from "viem";

export function createAnvilTestClient(): TestClient {
  return createTestClient({
    chain: foundry,
    mode: "anvil",
    transport: http("http://127.0.0.1:8545"),
  })
    .extend(publicActions)
    .extend(walletActions);
}

/**
 * Default test accounts from Anvil
 * These accounts have 10000 ETH each
 */
export const TEST_ACCOUNTS = {
  account0: {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const,
    privateKey:
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const,
  },
  account1: {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as const,
    privateKey:
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as const,
  },
  account2: {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as const,
    privateKey:
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a" as const,
  },
} as const;

export async function mineBlocks(client: TestClient, count: number) {
  await client.mine({ blocks: count });
}

export async function setBalance(
  client: TestClient,
  address: `0x${string}`,
  balance: bigint,
) {
  await client.setBalance({ address, value: balance });
}

export async function revertToSnapshot(
  client: TestClient,
  snapshotId: `0x${string}`,
) {
  await client.revert({ id: snapshotId });
}

export async function createSnapshot(
  client: TestClient,
): Promise<`0x${string}`> {
  return await client.snapshot();
}
