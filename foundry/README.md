# Foundry Smart Contracts

This directory contains the Foundry-based smart contract development environment for Svelte-ETH Starter.

## Prerequisites

### Recommended: Using mise

This project uses [mise](https://mise.jdx.dev/) to manage Foundry installation. The root `mise.toml` automatically installs the latest version of Foundry.

```bash
# Install mise (if not already installed)
curl https://mise.run | sh

# Install Foundry via mise (from project root)
mise install
```

### Alternative: Manual Installation

You can also install [Foundry](https://getfoundry.sh/) manually:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Git Submodules

This project uses git submodules for Foundry dependencies (e.g., `forge-std`). When cloning the repository:

```bash
# Clone with submodules
git clone --recurse-submodules <repository-url>

# Or if already cloned, initialize submodules
git submodule update --init --recursive
```

The submodules are managed by Foundry and tracked in `.gitmodules`.

## Quick Start

```bash
# Dependencies are already installed via git submodules
# If you need to add new libraries, use:
# forge install <username>/<repository>

# Build contracts
forge build

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Run tests with detailed output
forge test -vvv

# Generate coverage report
forge coverage

# Format Solidity code
forge fmt

# Lint contracts
pnpm run lint
```

## Project Structure

```
foundry/
├── src/                    # Smart contracts
│   └── YourContract.sol    # Example contract
├── script/                 # Deployment scripts
│   └── Deploy.s.sol        # Main deployment script
├── test/                   # Contract tests
│   └── YourContract.t.sol  # Tests for YourContract
├── foundry.toml            # Foundry configuration
├── package.json            # NPM scripts
└── anvil.sh               # Helper script for local node
```

## Local Development

### 1. Start Local Node (Anvil)

```bash
# Start anvil (runs in background)
pnpm run chain
# or
./anvil.sh

# Restart anvil
./anvil.sh --restart

# Kill anvil
./anvil.sh --kill

# View logs
tail -f anvil.log
```

Anvil runs on `http://localhost:8545` and provides 10 accounts with 10,000 ETH each.

### 2. Deploy Contracts Locally

```bash
# Deploy to local anvil instance (auto-generates TypeScript ABIs)
pnpm run deploy:anvil

# The deploy script will:
# 1. Deploy contracts to Anvil
# 2. Auto-generate TypeScript types at ../web/src/lib/contracts/deployedContracts.ts
```

The deployed contract addresses are saved to the `broadcast/` directory, and ABIs are automatically generated for the frontend.

### 3. Generate TypeScript ABIs (Manual)

If you need to regenerate ABIs without deploying:

```bash
# Generate TypeScript contract definitions
pnpm run generate

# This extracts ABIs from out/ and addresses from broadcast/
# Output: ../web/src/lib/contracts/deployedContracts.ts
```

The generated file contains:
- Contract ABIs (from `out/` directory)
- Deployed addresses (from `broadcast/` directory)
- Type-safe contract definitions for use in the frontend

## Testing

### Run Tests

```bash
# Run all tests
forge test

# Run tests with gas report
forge test --gas-report

# Run specific test
forge test --match-test test_SetGreeting

# Run tests for specific contract
forge test --match-contract YourContractTest

# Run tests with detailed logs (-vv, -vvv, -vvvv for more verbosity)
forge test -vvv
```

### Coverage

```bash
# Generate coverage report
forge coverage

# Generate detailed coverage with lcov
forge coverage --report lcov
```

### Gas Snapshots

```bash
# Create gas snapshot
forge snapshot

# Compare gas usage with snapshot
forge snapshot --diff
```

## Deploying to Testnets/Mainnet

### Setup

1. Create a `.env` file (see `.env.example`):

```bash
PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key
```

2. Load environment variables:

```bash
source .env
```

### Deploy to Sepolia

```bash
# Deploy and verify on Sepolia testnet
pnpm run deploy:sepolia

# Or manually
forge script script/Deploy.s.sol \
  --rpc-url sepolia \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

### Deploy to Other Networks

```bash
# Base Sepolia
pnpm run deploy:base-sepolia

# Optimism Sepolia
pnpm run deploy:optimism-sepolia

# Arbitrum Sepolia
pnpm run deploy:arbitrum-sepolia
```

### Manual Verification

If automatic verification fails during deployment:

```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  src/YourContract.sol:YourContract \
  --chain sepolia \
  --watch
```

## Configuration

### foundry.toml

The main Foundry configuration file. Key settings:

- **Solidity Version**: `0.8.28`
- **Optimizer**: Enabled with 200 runs
- **EVM Version**: Cancun
- **RPC Endpoints**: Pre-configured for major networks
- **Etherscan APIs**: For contract verification

### Package Scripts

Available in `package.json`:

- `pnpm run build` - Compile contracts
- `pnpm run test` - Run tests
- `pnpm run test:coverage` - Generate coverage
- `pnpm run test:gas` - Show gas report
- `pnpm run format` - Format code
- `pnpm run lint` - Lint contracts
- `pnpm run chain` - Start local node
- `pnpm run generate` - Generate TypeScript ABIs for frontend
- `pnpm run deploy:anvil` - Deploy to local node + generate ABIs
- `pnpm run deploy:sepolia` - Deploy to Sepolia + generate ABIs

## Writing Tests

Tests are written using Foundry's testing framework. Example:

```solidity
import {Test} from "forge-std/Test.sol";
import {YourContract} from "../src/YourContract.sol";

contract YourContractTest is Test {
    YourContract public yourContract;

    function setUp() public {
        yourContract = new YourContract(address(this));
    }

    function test_Example() public {
        // Your test here
    }
}
```

### Useful Test Utilities

- `vm.prank(address)` - Set msg.sender for next call
- `vm.startPrank(address)` - Set msg.sender for multiple calls
- `vm.deal(address, amount)` - Set ETH balance
- `vm.expectRevert()` - Expect next call to revert
- `vm.expectEmit()` - Expect event emission
- `makeAddr(string)` - Create labeled test address

## Adding Dependencies

Foundry uses git submodules to manage dependencies. When you install a library with `forge install`, it automatically:
1. Adds the library as a git submodule in the `lib/` directory
2. Updates `.gitmodules` to track the submodule
3. Commits the submodule to your repository

```bash
# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts

# Install other libraries
forge install <username>/<repository>

# Install specific version/tag
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0
```

After installing, you may need to update `remappings.txt` for import paths:

```
@openzeppelin/=lib/openzeppelin-contracts/
```

**Note**: Dependencies installed via `forge install` are tracked as git submodules. When others clone the repository, they'll need to initialize submodules (see "Git Submodules" section above).

## Troubleshooting

### Build fails with "file not found"

```bash
forge clean
forge build
```

### Tests fail unexpectedly

```bash
# Clear cache and rebuild
forge clean
forge build
forge test
```

### Anvil port already in use

```bash
# Kill anvil and restart
./anvil.sh --kill
./anvil.sh
```

### Missing dependencies / submodule errors

If you see errors about missing `forge-std` or other libraries:

```bash
# Initialize and update all submodules
git submodule update --init --recursive

# Or re-install dependencies
forge install
```

## Managing Multi-Chain Deployments

### How Deployments Are Merged

When you deploy to multiple chains, all deployments are **automatically merged** into a single `deployedContracts.ts` file:

1. Each deployment creates: `broadcast/Deploy.s.sol/<ChainId>/run-latest.json`
2. Running `pnpm run generate` reads **all** chain directories
3. Output contains all chains in one file:

```typescript
{
  "1": { "YourContract": { "address": "0x123...", "abi": [...] } },      // Mainnet
  "31337": { "YourContract": { "address": "0x456...", "abi": [...] } }, // Localhost
  "11155111": { "YourContract": { "address": "0x789...", "abi": [...] } } // Sepolia
}
```

### Important: Backup Production Deployments

The script reads from the `broadcast/` directory. By default, local deployments (chainId 31337) are git-ignored, but production deployments are **not automatically tracked**.

**Options:**

1. **Commit production broadcasts** (recommended):
   ```bash
   # After mainnet deployment
   git add broadcast/Deploy.s.sol/1/
   git commit -m "Deploy to mainnet"
   ```

2. **Or track them in .gitignore**:
   ```bash
   # Edit .gitignore to allow specific chains
   # Remove the comment from the chain you want to track
   ```

3. **Or backup separately**:
   - Export broadcast files to secure storage
   - Use deployment management tools

⚠️ **Warning**: If you delete the `broadcast/` directory and regenerate, you'll lose all deployment data. The script does not preserve data from the existing `deployedContracts.ts` - it only reads from `broadcast/`.

## Resources

- [Foundry Book](https://book.getfoundry.sh/) - Official Foundry documentation
- [Foundry GitHub](https://github.com/foundry-rs/foundry)
- [Solidity Docs](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
