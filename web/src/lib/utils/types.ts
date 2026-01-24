import type { deployedContracts } from "$lib/contracts";
import type { Config } from "$lib/wagmi/config";

export type WagmiChain = Config["chains"][number]["id"];

export type DeployedContracts = typeof deployedContracts;

export type DeployedChainStringIds = keyof DeployedContracts;
type StringToNumber<S extends string> = S extends `${infer N extends number}`
  ? N
  : never;
export type DeployedChains = StringToNumber<DeployedChainStringIds>;

// Make sure that all DeployedChains are defined in the wagmi config
type Test = Subset<DeployedChains, WagmiChain>;
type Subset<T, U> = T extends U ? true : false;
const _test: Test = true;

export type ContractName<TChainId extends DeployedChains> =
  keyof DeployedContracts[`${TChainId}`];
