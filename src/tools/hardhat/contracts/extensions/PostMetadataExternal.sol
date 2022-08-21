//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../PostMetadata.sol";

abstract contract PostMetadataExternal {
    PostMetadata internal _postMetadata;

    constructor(address postMetadataAddress) {
        _postMetadata = PostMetadata(postMetadataAddress);
    }
}
