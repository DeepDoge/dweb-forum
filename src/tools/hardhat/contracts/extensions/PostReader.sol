//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "../libs/SSTORE2.sol";

abstract contract PostReader is Context {
    struct Post {
        uint96 timelineGroup;
        uint160 timelineKey;
        address owner;
        address contentPointer;
    }

    struct PostContent {
        uint256 time;
        address[] mentions;
        bytes data;
    }

    function _getPost(uint160 postId) internal view virtual returns (Post memory) {}

    function _getContent(address contentPointer) internal view returns (PostContent memory) {
        return abi.decode(SSTORE2.read(contentPointer), (PostContent));
    }

    modifier onlyPostOwner(uint160 postId) {
        Post memory post = _getPost(postId);
        require(post.owner == _msgSender(), "You don't own this post.");
        _;
    }
}
