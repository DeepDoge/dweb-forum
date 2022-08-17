//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Posts.sol";
import "./PostMetadata.sol";

contract ResolvePost {
    Posts postsContract;
    PostMetadata postMetadataContract;

    constructor(address postsContractAddress, address postMetadataContractAddress) {
        postsContract = Posts(postsContractAddress);
        postMetadataContract = PostMetadata(postMetadataContractAddress);
    }

    function readPost(uint160 postId) private view returns(Posts.Post memory) {
        (uint96 timelineGroup, uint160 timelineKey, address owner, address contentPointer) = postsContract.posts(postId);
        return Posts.Post(timelineGroup, timelineKey, owner, contentPointer);
    }

    struct PostData {
        uint160 postId;
        Posts.Post post;
        Posts.PostContent postContent;
        bytes32[][] metadata;
    }

    function getPostData(uint160 postId, bytes32[][] memory metadata) external view returns (PostData memory) {
        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = postMetadataContract.postMetadatas(postId, metadata[i][0]);

        Posts.Post memory post = readPost(postId);
        PostData memory postData = PostData(postId, post, abi.decode(SSTORE2.read(post.contentPointer), (Posts.PostContent)), metadata);

        return postData;
    }

    function getPostDataFromTimeline(
        uint256 timelineId,
        uint256 postIndex,
        bytes32[][] memory metadata
    ) external view returns (PostData memory) {
        uint160 postId = postsContract.timelines(timelineId, postIndex);

        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = postMetadataContract.postMetadatas(postId, metadata[i][0]);

        Posts.Post memory post = readPost(postId);
        PostData memory postData = PostData(postId, post, abi.decode(SSTORE2.read(post.contentPointer), (Posts.PostContent)), metadata);

        return postData;
    }

}