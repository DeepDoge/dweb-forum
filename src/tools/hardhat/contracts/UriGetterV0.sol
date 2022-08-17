// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./extensions/ERC721UriGetter.sol";
import "./extensions/PostsExternal.sol";
import "./utils/Base64.sol";

contract UriGetterV0 is ERC721UriGetter, PostsExternal {
    using Strings for uint256;

    constructor(address postsContractAddress) PostsExternal(postsContractAddress) {}

    function tokenURI(uint256 tokenId) external pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(string(abi.encodePacked('{"name":', '"Post #', tokenId.toString(), '",', '"description":', '"..."', '}')))
                )
            );
    }

    function contractURI() external pure override returns (string memory) {
        return "";
    }
}
