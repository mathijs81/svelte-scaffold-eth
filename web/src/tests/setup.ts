import { beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import {
  createAnvilTestClient,
  createSnapshot,
  revertToSnapshot,
} from "./anvil";
import { setGlobalClient } from "$lib/query/globalClient";
import { createBlockchainQueryClient } from "$lib/query/config";
import { updateConfigForTest, type Config } from "$lib/wagmi/config";
import { createTestWagmiConfig } from "./wagmi-test-config";
import { TEST_ACCOUNTS } from "./anvil";
import { test as base } from "vitest";
import "@testing-library/jest-dom/vitest";
import { resetConnectionForTest } from "$lib/web3/createConnection.svelte";

/**
 * Global test setup for all tests
 *
 * This assumes Anvil is running on http://127.0.0.1:8545
 * Start Anvil before running tests: pnpm chain
 */

const testClient = createAnvilTestClient();
let initialSnapshot: `0x${string}`;

beforeAll(async () => {
  // Create a snapshot of the initial Anvil state
  // We'll revert to this after each test for isolation
  try {
    initialSnapshot = await createSnapshot(testClient);
    console.log("✓ Connected to Anvil and created initial snapshot");
  } catch (error) {
    console.error(
      "\n❌ Failed to connect to Anvil. Make sure it's running on http://127.0.0.1:8545",
    );
    console.error("   Run: pnpm chain\n");
    throw error;
  }
});

let testConfig: Config;

beforeEach(() => {
  setGlobalClient(createBlockchainQueryClient());
});

export const test = base.extend<{
  testConfig: Config;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: vitest expects {} here
  testConfig: async ({}, use) => {
    // Create a fresh test config for each test
    testConfig = createTestWagmiConfig([
      TEST_ACCOUNTS.account0.address,
      TEST_ACCOUNTS.account1.address,
    ]) as unknown as Config;
    // Make testconfig a deeply reactive object
    updateConfigForTest(testConfig);
    resetConnectionForTest();
    await use(testConfig);
  },
});

afterEach(async () => {
  // Revert to initial snapshot after each test for isolation
  if (initialSnapshot) {
    await revertToSnapshot(testClient, initialSnapshot);
    // Create a new snapshot for the next test
    initialSnapshot = await createSnapshot(testClient);
  }
  setGlobalClient(undefined);
});

afterAll(async () => {
  // Clean up if needed
  console.log("✓ Test cleanup complete");
});
