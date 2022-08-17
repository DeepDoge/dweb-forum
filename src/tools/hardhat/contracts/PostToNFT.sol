//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Posts.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract PostToNFT is ERC721Enumerable {
    Posts postsContract;

    constructor(address postsContractAddress) ERC721("DForum Post", "DFP") {
        postsContract = Posts(postsContractAddress);
    } 

    function readPost(uint160 postId) private view returns(uint96, uint160, address, address) {
        return postsContract.posts(postId);
    }

    function mintPostNft(uint160 postId) external {
        (, , address owner, ) = readPost(postId);
        require(owner == msg.sender, "You don't own this post.");
        _mint(msg.sender, postId);
    }
}