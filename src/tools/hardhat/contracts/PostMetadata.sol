//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./extensions/PostReadableExternal.sol";

contract PostMetadata is PostReadableExternal {
    constructor(address postsContractAddress) PostReadableExternal(postsContractAddress) {}

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
