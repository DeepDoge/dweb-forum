//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./extensions/ERC721UriExternal.sol";
import "./extensions/PostReadableExternal.sol";

contract PostNFT is ERC721UriExternal, PostReadableExternal {
    constructor(address postsContractAddress, address uriGetterAddress)
        ERC721("Decenterlized Forum", "DFM")
        ERC721UriExternal(uriGetterAddress)
        PostReadableExternal(postsContractAddress)
    {}

    function mintPostNft(uint160 postId) external {
        Post memory post = _getPost(postId);
        require(post.owner == _msgSender(), "You don't own this post.");
        _mint(_msgSender(), postId);
    }

    function burn(uint256 tokenId) public virtual {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner nor approved");
        _burn(tokenId);
    }
}
