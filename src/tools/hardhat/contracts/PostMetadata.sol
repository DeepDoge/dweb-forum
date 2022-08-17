//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Posts.sol";

contract PostMetadata {
    Posts postsContract;

    constructor(address postsContractAddress) {
        postsContract = Posts(postsContractAddress);
    }

    function readPost(uint160 postId) private view returns(uint96, uint160, address, address) {
        return postsContract.posts(postId);
    }

    modifier onlyPostOwner(uint160 postId) {
        (,, address owner,) = readPost(postId);
        require(owner == msg.sender, "You don't own this post.");
        _;
    }

    mapping(uint160 => mapping(bytes32 => bytes32)) public postMetadatas;
    event PostMetadataSet(uint160 indexed postId, bytes32 key, bytes32 value);

    function setPostMetadata(
        uint160 postId,
        bytes32 key,
        bytes32 value
    ) public onlyPostOwner(postId) {
        postMetadatas[postId][key] = value;
        emit PostMetadataSet(postId, key, value);
    }
}