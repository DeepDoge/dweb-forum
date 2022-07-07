//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Profile {
    mapping(address => mapping(bytes32 => bytes32)) public profiles;
    event ProfileSet(address indexed owner, bytes32 indexed key, bytes32 value, uint256 timestamp);

    function setProfile(bytes32 key, bytes32 value) external {
        profiles[msg.sender][key] = value;
        emit ProfileSet(msg.sender, key, value, block.timestamp);
    }
}
