import { http, createConfig } from "@wagmi/core";
import { injected } from "@wagmi/connectors";
import { chains } from "./chains";

/**
 * Wagmi configuration for Web3 connections
 * Uses @wagmi/core (framework-agnostic) instead of React wagmi
 */
export let config = createConfig({
  chains: chains,
  connectors: [
    injected(),
    // Uncomment to add WalletConnect support
    // walletConnect({
    //   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    // }),
  ],
  transports: {
    // Foundry local chain
    31337: http("http://127.0.0.1:8545"),

    // Mainnets
    1: http(), // Ethereum mainnet
    42161: http(), // Arbitrum
    10: http(), // Optimism
    8453: http(), // Base
    137: http(), // Polygon

    // Testnets
    11155111: http(), // Sepolia
    421614: http(), // Arbitrum Sepolia
    11155420: http(), // Optimism Sepolia
    84532: http(), // Base Sepolia
    80002: http(), // Polygon Amoy
  },
});

export function updateConfigForTest(newConfig: Config) {
  config = newConfig;
}

/**
 * Type helper to extract the config type
 */
export type Config = typeof config;
