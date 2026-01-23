// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { Test, console } from "forge-std/Test.sol";
import { YourContract } from "../src/YourContract.sol";

contract YourContractTest is Test {
    YourContract public yourContract;
    address public owner;
    address public user1;
    address public user2;

    // Events to test
    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);

    function setUp() public {
        // Set up test accounts
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy the contract as owner
        vm.prank(owner);
        yourContract = new YourContract(owner);

        // Fund test accounts with ETH
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    function test_InitialState() public view {
        assertEq(yourContract.owner(), owner);
        assertEq(yourContract.greeting(), "Building Unstoppable Apps!!!");
        assertEq(yourContract.premium(), false);
        assertEq(yourContract.totalCounter(), 0);
    }

    function test_SetGreeting() public {
        string memory newGreeting = "Hello, Svelte!";

        vm.prank(user1);
        yourContract.setGreeting(newGreeting);

        assertEq(yourContract.greeting(), newGreeting);
        assertEq(yourContract.totalCounter(), 1);
        assertEq(yourContract.userGreetingCounter(user1), 1);
        assertEq(yourContract.premium(), false);
    }

    function test_SetGreetingWithValue() public {
        string memory newGreeting = "Premium Greeting";

        vm.prank(user1);
        yourContract.setGreeting{ value: 1 ether }(newGreeting);

        assertEq(yourContract.greeting(), newGreeting);
        assertEq(yourContract.premium(), true);
        assertEq(address(yourContract).balance, 1 ether);
    }

    function test_SetGreetingEmitsEvent() public {
        string memory newGreeting = "Event Test";

        vm.expectEmit(true, true, true, true);
        emit GreetingChange(user1, newGreeting, false, 0);

        vm.prank(user1);
        yourContract.setGreeting(newGreeting);
    }

    function test_SetGreetingWithValueEmitsEvent() public {
        string memory newGreeting = "Premium Event Test";

        vm.expectEmit(true, true, true, true);
        emit GreetingChange(user1, newGreeting, true, 1 ether);

        vm.prank(user1);
        yourContract.setGreeting{ value: 1 ether }(newGreeting);
    }

    function test_MultipleUsersSetGreeting() public {
        vm.prank(user1);
        yourContract.setGreeting("User 1 greeting");

        vm.prank(user2);
        yourContract.setGreeting("User 2 greeting");

        assertEq(yourContract.totalCounter(), 2);
        assertEq(yourContract.userGreetingCounter(user1), 1);
        assertEq(yourContract.userGreetingCounter(user2), 1);
    }

    function test_SameUserMultipleGreetings() public {
        vm.startPrank(user1);
        yourContract.setGreeting("First");
        yourContract.setGreeting("Second");
        yourContract.setGreeting("Third");
        vm.stopPrank();

        assertEq(yourContract.totalCounter(), 3);
        assertEq(yourContract.userGreetingCounter(user1), 3);
    }

    function test_Withdraw() public {
        // Send ETH to contract
        vm.prank(user1);
        yourContract.setGreeting{ value: 5 ether }("Premium");

        uint256 ownerBalanceBefore = owner.balance;
        uint256 contractBalance = address(yourContract).balance;

        // Owner withdraws
        vm.prank(owner);
        yourContract.withdraw();

        assertEq(address(yourContract).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + contractBalance);
    }

    function test_WithdrawRevertsForNonOwner() public {
        vm.prank(user1);
        yourContract.setGreeting{ value: 1 ether }("Premium");

        vm.prank(user2);
        vm.expectRevert("Not the Owner");
        yourContract.withdraw();
    }

    function test_ReceiveETH() public {
        vm.prank(user1);
        (bool success,) = address(yourContract).call{ value: 1 ether }("");

        assertTrue(success);
        assertEq(address(yourContract).balance, 1 ether);
    }

    function testFuzz_SetGreeting(string memory randomGreeting) public {
        vm.prank(user1);
        yourContract.setGreeting(randomGreeting);

        assertEq(yourContract.greeting(), randomGreeting);
        assertEq(yourContract.totalCounter(), 1);
    }

    function testFuzz_SetGreetingWithValue(uint256 value) public {
        vm.assume(value > 0 && value <= 100 ether);

        vm.deal(user1, value);
        vm.prank(user1);
        yourContract.setGreeting{ value: value }("Fuzz test");

        assertEq(yourContract.premium(), true);
        assertEq(address(yourContract).balance, value);
    }
}
