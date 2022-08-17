//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Posts.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract PostToNFT is ERC721Enumerable  {
    using Strings for uint256;
    
    Posts postsContract;

    constructor(address postsContractAddress) ERC721("DForum", "DFM") {
        postsContract = Posts(postsContractAddress);
    } 

    function readPost(uint160 postId) private view returns(uint96, uint160, address, address) {
        return postsContract.posts(postId);
    }

    mapping(uint160 => uint256) public mintVersion;
    function mintPostNft(uint160 postId) external {
        (, , address owner, ) = readPost(postId);
        require(owner == _msgSender(), "You don't own this post.");
        _mint(_msgSender(), postId);
        mintVersion[postId] = postsContract.postContentHistoryLength(postId);
    }

    function burn(uint256 tokenId) public virtual {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner nor approved");
        _burn(tokenId);
    }
}