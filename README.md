# Svelte Scaffold ETH

A modern starter template for building Ethereum dApps with **SvelteKit 5**, **Foundry**, and **DaisyUI**.

Inspired by [scaffold-eth-2](https://github.com/scaffold-eth/scaffold-eth-2) but built with the Svelte ecosystem.

## Current Features

- ✅ **Debug Contracts Page** - Interactive auto-generated UI to test all contracts you're developing under `foundry/` (read & write)
- ✅ **Wallet Integration** - Connect MetaMask or any other browser-injected wallet
- ✅ **Multi-chain Support** - Pre-configured for 10+ networks (Mainnet, Sepolia, Arbitrum, Optimism, Base, Polygon, etc.)
- ✅ **Type-safe Contracts** - Full TypeScript types auto-generated from your Solidity ABIs
- ✅ **Contract updates auto-update frontend** - When you locally deploy, the frontend automatically gets the new contract addresses and ABIs

### Planned Improvements
- **Full Contract Hot Reload** - Deploy & frontend update on any save of .sol files
- **Transaction Notifications** - Toast notifications for transaction status
- **Other features from Scaffold-ETH 2**:
  - **Burner Wallet** - Auto-generated throwaway wallet for frictionless local development
  - **Built-in Block Explorer** - Browse blocks, transactions, and addresses on any network
  - **Event History** - View and filter historical contract events

## Stack details

- **SvelteKit 5** with **DaisyUI** for a clean, fast UI
- **Foundry** for blazing-fast smart contract development and testing
- **@wagmi/core + Viem** for type-safe Web3 interactions

## Quick Start

```bash
# Install Foundry (using mise - recommended)
mise install

# Set up foundry/lib/forge-std submodule
git submodule update --init --recursive

# Install dependencies for both foundry and web
pnpm install

# Start local Foundry node (in terminal 1)
pnpm chain

# Deploy contracts + generate `web/src/lib/contracts/deployedContracts.ts` (in terminal 2)
pnpm deploy:anvil

# Start the web dev server (in terminal 3)
pnpm dev

# Open http://localhost:5173
```

Your app is now running with:

- Local Foundry node on `http://localhost:8545`
- Contracts deployed via Foundry scripts (see `foundry/broadcast/`)
- Generated contract deployment/ABI map at `web/src/lib/contracts/deployedContracts.ts`

## Available Commands

### Development
```bash
pnpm dev              # Start the frontend dev server
pnpm chain            # Start local Anvil node
pnpm chain:kill       # Stop the Anvil node
pnpm chain:restart    # Restart the Anvil node
pnpm deploy:anvil     # Deploy contracts to local chain & regenerate types
```

### Deployment
```bash
pnpm deploy:sepolia              # Deploy to Sepolia testnet
pnpm deploy:base-sepolia         # Deploy to Base Sepolia
pnpm deploy:optimism-sepolia     # Deploy to Optimism Sepolia
pnpm deploy:arbitrum-sepolia     # Deploy to Arbitrum Sepolia
```

### Testing
```bash
pnpm test              # Run all tests (contracts + frontend)
pnpm test:contracts    # Run Foundry contract tests
pnpm test:web          # Run frontend unit + E2E tests
pnpm test:e2e          # Run Playwright E2E tests only
pnpm test:coverage     # Generate Foundry coverage report
pnpm test:gas          # Run tests with gas reporting
```

### Code Quality
```bash
pnpm check      # Type-check frontend code
pnpm format     # Format all code (Solidity + TypeScript/Svelte)
pnpm lint       # Lint all code
pnpm clean      # Clean build artifacts
```

### Building
```bash
pnpm build      # Build contracts and frontend for production
pnpm preview    # Preview production build locally
```

## Contributing

This is a starter template - fork it, customize it, make it yours!

Suggestions and PRs welcome.

## License

MIT

## Acknowledgments

- [scaffold-eth-2](https://github.com/scaffold-eth/scaffold-eth-2) - The original inspiration
- [scaffold-eth-svelte5](https://github.com/zapaz/scaffold-eth-svelte5) - More inspiration for the Svelte part
- [@wagmi/core](https://wagmi.sh/core) - Framework-agnostic Ethereum library
- [viem](https://viem.sh) - TypeScript library for Ethereum
- [Foundry](https://getfoundry.sh) - Fast, portable, and modular toolkit for Ethereum
- [SvelteKit](https://kit.svelte.dev) - The fastest way to build web applications
- [DaisyUI](https://daisyui.com) - Beautiful, themeable UI components

