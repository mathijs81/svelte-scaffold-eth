# Foundry Utilities

This directory contains utility scripts for the Foundry contracts workspace.

## generateContracts.ts

Automatically generates TypeScript contract definitions from Foundry build artifacts and deployment data.

### What it does

1. **Extracts ABIs** from the `out/` directory (Foundry compilation artifacts)
2. **Reads deployment addresses** from the `broadcast/` directory (created by `forge script --broadcast`)
3. **Generates a TypeScript file** at `../web/src/lib/contracts/deployedContracts.ts`

### Usage

```bash
# Run directly
pnpm run generate

# Or as part of deployment (auto-runs after deploy)
pnpm run deploy:anvil
```

### Output

The script generates a TypeScript file with this structure:

```typescript
const deployedContracts = {
  "31337": {  // Chain ID (localhost/anvil)
    "YourContract": {
      "address": "0x5b73...",
      "abi": [/* Full ABI array */]
    }
  },
  "11155111": {  // Chain ID (sepolia)
    "YourContract": {
      "address": "0x1234...",
      "abi": [/* Full ABI array */]
    }
  }
} as const;

export default deployedContracts;
```

### Contract Filtering

The script automatically excludes:
- Test contracts (`*Test.sol`)
- Deployment scripts (`*Script.sol`, `Deploy.sol`)
- Forge-std utilities (`Std*`, `Vm`, `console*`, etc.)

Only your actual application contracts are included.

### Integration

This file is consumed by the SvelteKit frontend to:
- Get type-safe contract ABIs
- Access deployed contract addresses
- Enable auto-completion for contract function calls

### Multi-Chain Deployments

The script **merges all chains** automatically:

```
broadcast/
├── Deploy.s.sol/
│   ├── 1/              # Mainnet
│   ├── 31337/          # Localhost
│   └── 11155111/       # Sepolia
```

All chains are combined into one output file with separate keys per chain ID.

**Important**: The script only reads from `broadcast/`, not from existing `deployedContracts.ts`. This means:
- ✅ Keep the `broadcast/` directory to preserve all deployments
- ❌ Deleting `broadcast/` will lose all deployment data
- 💡 Consider committing production broadcasts to git for backup

### Troubleshooting

**No deployments found:**
- Make sure you've run a deployment with `--broadcast` flag
- Check that the `broadcast/` directory exists and contains `run-latest.json` files

**Lost production deployment data:**
- The script doesn't read from existing `deployedContracts.ts`, only from `broadcast/`
- Always keep backups of `broadcast/` directory for production deployments
- Or commit production broadcasts to git

**Wrong contracts included:**
- Update the `skipPatterns` array in `generateContracts.ts`
- Patterns are matched against contract names (case-sensitive)

**Missing ABIs:**
- Run `forge build` to generate contract artifacts in `out/`
- Ensure contract names match their file names
