// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script, console } from "forge-std/Script.sol";
import { YourContract } from "../src/YourContract.sol";

/**
 * @title Deploy
 * @notice Script to deploy all contracts
 * @dev This script deploys YourContract with the deployer as the owner
 *
 * Usage:
 *   Deploy to local anvil:
 *     forge script script/Deploy.s.sol --rpc-url localhost --broadcast
 *
 *   Deploy to testnet (e.g., Sepolia):
 *     forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
 *
 *   Deploy with a specific private key:
 *     forge script script/Deploy.s.sol --rpc-url sepolia --private-key $PRIVATE_KEY --broadcast
 */
contract Deploy is Script {
    function run() public {
        // Get the deployer's address (will be the owner of contracts)
        address deployer = msg.sender;

        console.log("Deploying contracts with deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy YourContract
        YourContract yourContract = new YourContract(deployer);
        console.log("YourContract deployed at:", address(yourContract));

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("YourContract:", address(yourContract));
        console.log("Owner:", deployer);
        console.log("Initial greeting:", yourContract.greeting());
    }
}
