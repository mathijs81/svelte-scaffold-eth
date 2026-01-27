import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { connect, disconnect, getConnection, switchChain } from "@wagmi/core";
import { describe, expect } from "vitest";
import { test } from "../../tests/setup";
import Header from "./Header.svelte";

/**
 * Header component tests using real Anvil + mock connector
 */
describe("Header - wallet connection logic", () => {
  test("connects & disconnects wallet and shows correct address", async ({
    testConfig,
  }) => {
    render(Header);

    // address 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --> 0xf39f...2266
    const shortenedAddress = "0xf39F...2266";
    expect(screen.queryByText(shortenedAddress)).toBeNull();

    const user = userEvent.setup();

    let connection = getConnection(testConfig);
    expect(connection.isConnected).toBe(false);

    const connectButton = screen.getByRole("button", {
      name: "Connect Wallet",
    });
    await user.click(connectButton);

    connection = getConnection(testConfig);
    expect(connection.isConnected).toBe(true);
    expect(screen.queryByText(shortenedAddress)).toBeInTheDocument();

    await disconnect(testConfig);

    connection = getConnection(testConfig);
    expect(connection.isConnected).toBe(false);
    expect(screen.queryByText(shortenedAddress)).not.toBeInTheDocument();
  });

  test("detects wrong chain and switches", async ({ testConfig }) => {
    const shortenedAddress = "0xf39F...2266";
    render(Header);
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    expect(screen.queryByText(/wrong network/)).not.toBeInTheDocument();

    await connect(testConfig, {
      connector: testConfig.connectors[0],
      chainId: 1,
    });

    expect(screen.getByText(shortenedAddress)).toBeInTheDocument();
    expect(screen.queryByText(/wrong network/)).toBeInTheDocument();

    await switchChain(testConfig, { chainId: 31337 });
    expect(screen.queryByText(/wrong network/)).not.toBeInTheDocument();
  });

  test("shows correct chain name for Foundry", async ({ testConfig }) => {
    render(Header);
    expect(screen.queryByText("Foundry #")).not.toBeInTheDocument();
    await connect(testConfig, {
      connector: testConfig.connectors[0],
      chainId: 31337,
    });
    expect(screen.queryByText("Foundry")).toBeInTheDocument();
  });
});
