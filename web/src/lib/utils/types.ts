import type { deployedContracts } from "$lib/contracts/deployedContracts";
import type { Config } from "$lib/wagmi/config";

export type WagmiChain = Config["chains"][number]["id"];

// DeployedContracts is contract name -> ContractInfo

export type DeployedContracts = typeof deployedContracts;
export type ContractName = keyof DeployedContracts;
