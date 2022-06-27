//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Profile {
    mapping(address => mapping(uint256 => uint256)) public profiles;
    event ProfileSet(address indexed owner, uint256 indexed key, uint256 value, uint256 timestamp);

    function setProfile(uint256 key, uint256 value) external {
        profiles[msg.sender][key] = value;
        emit ProfileSet(msg.sender, key, value, block.timestamp);
    }
}
