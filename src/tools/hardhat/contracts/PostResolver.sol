//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./extensions/PostsExternal.sol";
import "./extensions/PostMetadataExternal.sol";

contract PostResolver is PostsExternal, PostMetadataExternal {
    constructor(address postsContractAddress, address postMetadataContractAddress)
        PostsExternal(postsContractAddress)
        PostMetadataExternal(postMetadataContractAddress)
    {}

    struct PostData {
        uint160 postId;
        Post post;
        PostContent postContent;
        bytes32[][] metadata;
    }

    function getPostData(uint160 postId, bytes32[][] memory metadata) external view returns (PostData memory) {
        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = _postMetadata.postMetadatas(postId, metadata[i][0]);

        Post memory post = _getPost(postId);
        PostData memory postData = PostData(postId, post, _getContent(post.contentPointer), metadata);

        return postData;
    }

    function getPostDataFromTimeline(
        uint256 timelineId,
        uint256 postIndex,
        bytes32[][] memory metadata
    ) external view returns (PostData memory) {
        uint160 postId = _posts.timelines(timelineId, postIndex);

        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = _postMetadata.postMetadatas(postId, metadata[i][0]);

        Post memory post = _getPost(postId);
        PostData memory postData = PostData(postId, post, _getContent(post.contentPointer), metadata);

        return postData;
    }
}
