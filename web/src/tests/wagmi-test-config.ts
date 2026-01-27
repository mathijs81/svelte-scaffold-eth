import { createConfig, http } from "@wagmi/core";
import { mock } from "@wagmi/connectors";
import { foundry } from "$lib/wagmi/chains";
import { TEST_ACCOUNTS } from "./anvil";
import { mainnet } from "viem/chains";
/**
 * Create a test-specific wagmi config with mock connector
 * This config uses the mock connector to simulate wallet interactions
 * while connected to a real Anvil instance
 *
 * @param accounts - Array of account addresses to make available
 */
export function createTestWagmiConfig(
  accounts: readonly [`0x${string}`, ...`0x${string}`[]] = [
    TEST_ACCOUNTS.account0.address,
  ],
) {
  return createConfig({
    chains: [mainnet, foundry],
    connectors: [
      mock({
        accounts,
      }),
    ],
    transports: {
      [mainnet.id]: http(),
      [foundry.id]: http("http://127.0.0.1:8545"),
    },
  });
}
