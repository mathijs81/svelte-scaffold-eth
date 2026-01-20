#!/usr/bin/env tsx

/**
 * Generates deployedContracts.ts from Foundry build artifacts and deployment data
 * This script:
 * 1. Reads ABIs from the `out/` directory (Foundry build artifacts)
 * 2. Reads deployment addresses from `broadcast/` directory (created by forge script --broadcast)
 * 3. Generates a TypeScript file with type-safe contract definitions
 * 4. Outputs to ../web/src/lib/contracts/deployedContracts.ts
 */

import fs from "fs";
import path from "path";

const CONTRACTS_DIR = path.join(__dirname, "..");
const OUT_DIR = path.join(CONTRACTS_DIR, "out");
const BROADCAST_DIR = path.join(CONTRACTS_DIR, "broadcast");
const TARGET_DIR = path.join(CONTRACTS_DIR, "..", "web", "src", "lib", "contracts");

// Chain ID mapping for network names
const CHAIN_ID_MAP: Record<string, number> = {
  localhost: 31337,
  anvil: 31337,
  mainnet: 1,
  sepolia: 11155111,
  optimism: 10,
  "optimism-sepolia": 11155420,
  arbitrum: 42161,
  "arbitrum-sepolia": 421614,
  base: 8453,
  "base-sepolia": 84532,
  polygon: 137,
  "polygon-amoy": 80002,
};

interface ContractAbi {
  type: string;
  name?: string;
  inputs?: any[];
  outputs?: any[];
  stateMutability?: string;
}

interface DeployedContract {
  address: string;
  abi: ContractAbi[];
}

interface ChainContracts {
  [contractName: string]: DeployedContract;
}

interface AllContracts {
  [chainId: string]: ChainContracts;
}

/**
 * Get all contract names from the out directory
 */
function getContractNames(): string[] {
  if (!fs.existsSync(OUT_DIR)) {
    console.error("❌ out/ directory not found. Run 'forge build' first.");
    process.exit(1);
  }

  const entries = fs.readdirSync(OUT_DIR, { withFileTypes: true });
  const contractNames: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.endsWith(".sol")) {
      const contractName = entry.name.replace(".sol", "");
      const jsonPath = path.join(OUT_DIR, entry.name, `${contractName}.json`);

      if (fs.existsSync(jsonPath)) {
        // Skip test contracts, scripts, and forge-std utilities
        const skipPatterns = [
          "Test",
          "Script",
          "Deploy",
          "Std",       // StdAssertions, StdChains, etc.
          "Vm",        // Forge VM
          "console",   // console and safeconsole
          "IMulticall", // Forge multicall interface
        ];

        const shouldSkip = skipPatterns.some(pattern => contractName.includes(pattern));

        if (!shouldSkip) {
          contractNames.push(contractName);
        }
      }
    }
  }

  return contractNames;
}

/**
 * Read ABI for a contract from the out directory
 */
function getContractAbi(contractName: string): ContractAbi[] {
  const jsonPath = path.join(OUT_DIR, `${contractName}.sol`, `${contractName}.json`);

  if (!fs.existsSync(jsonPath)) {
    console.warn(`⚠️  ABI not found for ${contractName}`);
    return [];
  }

  const contractJson = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  return contractJson.abi;
}

/**
 * Parse deployment addresses from broadcast directory
 * Foundry creates broadcast/<ChainId>/run-latest.json during deployment
 */
function getDeploymentAddresses(): Record<number, Record<string, string>> {
  const deployments: Record<number, Record<string, string>> = {};

  if (!fs.existsSync(BROADCAST_DIR)) {
    console.warn("⚠️  No broadcast/ directory found. Contracts haven't been deployed yet.");
    console.warn("   Run deployment with: forge script script/Deploy.s.sol --broadcast --rpc-url <network>");
    return deployments;
  }

  // Read all deployment directories (e.g., Deploy.s.sol/)
  const scriptDirs = fs.readdirSync(BROADCAST_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  for (const scriptDir of scriptDirs) {
    const scriptPath = path.join(BROADCAST_DIR, scriptDir.name);

    // Read all chain directories within each script directory
    const chainDirs = fs.readdirSync(scriptPath, { withFileTypes: true })
      .filter(entry => entry.isDirectory());

    for (const chainDir of chainDirs) {
      const chainId = parseInt(chainDir.name);
      const runLatestPath = path.join(scriptPath, chainDir.name, "run-latest.json");

      if (!fs.existsSync(runLatestPath)) {
        continue;
      }

      try {
        const runData = JSON.parse(fs.readFileSync(runLatestPath, "utf-8"));

        if (!deployments[chainId]) {
          deployments[chainId] = {};
        }

        // Parse transactions to find contract deployments
        for (const tx of runData.transactions || []) {
          if (tx.transactionType === "CREATE" && tx.contractName) {
            deployments[chainId][tx.contractName] = tx.contractAddress;
            console.log(`  ✓ Found ${tx.contractName} on chain ${chainId}: ${tx.contractAddress}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Error reading deployment data for chain ${chainId}:`, error);
      }
    }
  }

  return deployments;
}

/**
 * Generate the deployedContracts.ts file
 */
function generateContractsFile() {
  console.log("🔨 Generating deployed contracts...\n");

  const contractNames = getContractNames();
  console.log(`📝 Found ${contractNames.length} contracts: ${contractNames.join(", ")}\n`);

  const deploymentAddresses = getDeploymentAddresses();
  const allContracts: AllContracts = {};

  // Build the contracts object
  for (const [chainIdStr, contracts] of Object.entries(deploymentAddresses)) {
    const chainId = parseInt(chainIdStr);
    allContracts[chainId] = {};

    for (const [contractName, address] of Object.entries(contracts)) {
      const abi = getContractAbi(contractName);

      if (abi.length === 0) {
        console.warn(`⚠️  Skipping ${contractName} - no ABI found`);
        continue;
      }

      allContracts[chainId][contractName] = {
        address,
        abi,
      };
    }
  }

  // If no deployments found, create a default structure with ABIs only
  if (Object.keys(allContracts).length === 0) {
    console.log("ℹ️  No deployments found, generating ABIs only for localhost (31337)...\n");
    allContracts[31337] = {};

    for (const contractName of contractNames) {
      const abi = getContractAbi(contractName);
      allContracts[31337][contractName] = {
        address: "0x0000000000000000000000000000000000000000", // Placeholder
        abi,
      };
    }
  }

  // Generate TypeScript content
  const contractsContent = JSON.stringify(allContracts, null, 2);

  const fileContent = `/**
 * This file is autogenerated by scripts/generateContracts.ts
 * Do not edit it manually or your changes will be overwritten.
 */

const deployedContracts = ${contractsContent} as const;

export default deployedContracts;
`;

  // Ensure target directory exists
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  // Write the file
  const targetPath = path.join(TARGET_DIR, "deployedContracts.ts");
  fs.writeFileSync(targetPath, fileContent);

  console.log(`\n✅ Generated: ${targetPath}`);
  console.log(`   Chains: ${Object.keys(allContracts).join(", ")}`);
  console.log(`   Contracts per chain: ${Object.keys(allContracts[Object.keys(allContracts)[0]] || {}).join(", ")}`);
}

// Run the generator
try {
  generateContractsFile();
} catch (error) {
  console.error("❌ Error generating contracts:", error);
  process.exit(1);
}
