//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Migrations {
    address public owner;
    uint256 public last_completed_migration;
    address public lastVersionContractAddress;

    constructor() {
        owner = msg.sender;
    }

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function upgrade(address contractAddress) public restricted {
        lastVersionContractAddress = contractAddress;
    }
}
