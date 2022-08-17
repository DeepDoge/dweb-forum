//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PostReader.sol";
import "../Posts.sol";

contract PostsExternal is PostReader {
    Posts internal _posts;

    constructor(address postsContractAddress) {
        _posts = Posts(postsContractAddress);
    }

    function _getPost(uint160 postId) internal view override returns(Post memory) {
        (uint96 timelineGroup, uint160 timelineKey, address owner, address contentPointer) = _posts.posts(postId);
        return Post(timelineGroup, timelineKey, owner, contentPointer);
    }
}
