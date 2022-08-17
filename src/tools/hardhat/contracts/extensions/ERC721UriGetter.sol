// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

abstract contract ERC721UriGetter {
    function tokenURI(uint256 tokenId) external view virtual returns(string memory) {}
    function contractURI() external view virtual returns(string memory) {}
}