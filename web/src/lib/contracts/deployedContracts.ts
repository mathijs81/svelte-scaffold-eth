import type { Abi } from "viem";
import * as generated from "./generated";

export type ContractInfo = {
  abi: Abi;
  deployments: Record<number, `0x${string}`>;
};

function process() {
  const contractAbis: Record<string, ContractInfo> = {};
  for (const varName in generated) {
    if (varName.endsWith("Abi")) {
      const contractName = varName.substring(0, varName.length - 3);
      const addressVarName = `${contractName}Address`;
      // biome-ignore lint/performance/noDynamicNamespaceImportAccess: we want to dynamically import for debug page
      const address = generated[addressVarName as keyof typeof generated];
      const deployments: Record<number, `0x${string}`> = {};
      if (typeof address === "object") {
        for (const chainId of Object.keys(address)) {
          const numberChainId = Number(chainId);
          if (!Number.isNaN(numberChainId)) {
            deployments[numberChainId] = address[
              chainId as keyof typeof address
            ] as `0x${string}`;
          }
        }
      }

      const info = {
        // biome-ignore lint/performance/noDynamicNamespaceImportAccess: we want to dynamically import for debug page
        abi: generated[varName as keyof typeof generated] as Abi,
        deployments: deployments,
      };
      contractAbis[contractName] = info;
    }
  }
  return contractAbis;
}

const contractAbis = process();

export type ContractName = keyof typeof contractAbis;

export const deployedContracts: Record<ContractName, ContractInfo> =
  contractAbis;
