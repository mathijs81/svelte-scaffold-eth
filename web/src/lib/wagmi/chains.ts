import type { WagmiChain } from "$lib/utils/types";
import * as viemChains from "viem/chains";

/**
 * Foundry local chain configuration
 */
export const foundry = {
  id: 31337,
  name: "Foundry",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: { name: "Local Explorer", url: "http://localhost:5173/explorer" },
  },
} as const satisfies viemChains.Chain;

/**
 * All supported chains for the application
 */
export const chains = [
  foundry,
  viemChains.mainnet,
  viemChains.sepolia,
  viemChains.arbitrum,
  viemChains.arbitrumSepolia,
  viemChains.optimism,
  viemChains.optimismSepolia,
  viemChains.base,
  viemChains.baseSepolia,
  viemChains.polygon,
  viemChains.polygonAmoy,
] as const;

/**
 * Application-wide scaffold configuration
 */
export const scaffoldConfig = {
  // TODO: the target network should probably be settable from .env
  // The network on which your dApp runs
  targetNetworks: [foundry],

  // Polling interval for read operations (in milliseconds)
  // Faster for local chains, slower for remote chains
  pollingInterval: 4000,

  // RPC provider URLs (optional - uses public RPCs by default)
  // Add your own Alchemy/Infura keys here for better rate limits
  rpcProviderUrls: {
    // mainnet: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    //   ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    //   : undefined,
  },

  // Block explorer API keys for contract verification
  blockExplorerApiKeys: {
    // etherscan: process.env.ETHERSCAN_API_KEY,
  },
} as const;

/**
 * Get the target network (first network in targetNetworks array)
 */
export const getTargetNetwork = () => scaffoldConfig.targetNetworks[0];
export const targetChainId = scaffoldConfig.targetNetworks[0].id as WagmiChain;
