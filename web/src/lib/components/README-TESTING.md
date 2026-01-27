# Component Testing with Anvil

This directory contains tests that run against a real Anvil instance.

## Running Tests

1. **Start Anvil** (in a separate terminal):
   ```bash
   pnpm chain
   ```

2. **Run tests**:
   ```bash
   pnpm test:unit
   ```

## Test Strategy

We use a **real blockchain + mock connector** approach:

- **Anvil**: Local Ethereum node running on http://127.0.0.1:8545
- **Mock Connector**: Wagmi's `mock()` connector simulates wallet interactions
- **Test Client**: Viem's `createTestClient()` for controlling Anvil

### Benefits

✅ Fast (localhost blockchain)
✅ Predictable (deterministic test accounts)
✅ Isolated (snapshot/revert between tests)
✅ Real blockchain behavior (no mocking complexity)

### Test Accounts

Anvil provides 10 accounts with 10000 ETH each. We use:

- **account0**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **account1**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **account2**: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

## Test Utilities

### `createTestWagmiConfig()`
Creates a wagmi config with mock connector for testing.

```typescript
const testConfig = createTestWagmiConfig([TEST_ACCOUNTS.account0.address]);
```

### `createAnvilTestClient()`
Creates a viem test client for controlling Anvil.

```typescript
const client = createAnvilTestClient();
await client.mine({ blocks: 1 }); // Mine a block
await client.setBalance({ address, value: parseEther("100") }); // Set balance
```

### Test Isolation

Each test automatically:
1. Starts with a clean Anvil snapshot
2. Reverts to that snapshot after the test

This ensures tests don't interfere with each other.

## Example Test

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { connect, getAccount } from "@wagmi/core";
import { createTestWagmiConfig } from "../../tests/wagmi-test-config";
import { TEST_ACCOUNTS } from "../../tests/anvil";

describe("My Component", () => {
  let testConfig;

  beforeEach(() => {
    testConfig = createTestWagmiConfig();
  });

  it("connects wallet", async () => {
    await connect(testConfig, { connector: testConfig.connectors[0] });

    const account = getAccount(testConfig);
    expect(account.isConnected).toBe(true);
    expect(account.address).toBe(TEST_ACCOUNTS.account0.address);
  });
});
```

## Next Steps

Once these logic tests are working, we'll create:
1. Full component rendering tests (with Svelte components)
2. Playwright E2E tests (with real browser + Anvil)
