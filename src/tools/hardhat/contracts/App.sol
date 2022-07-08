//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./SSTORE.sol";

contract App {
    /* 
    ==========================
    Timeline
    ==========================
    */

    mapping(uint256 => mapping(uint256 => uint256[])) timelines;

    function getTimelineLength(uint256 group, uint256 id) external view returns (uint256) {
        return timelines[group][id].length;
    }

    event TimelineAddPost(
        uint256 indexed timelineGroup,
        uint256 indexed timelineId,
        uint256 postId,
        address owner,
        uint256 timelineLength
    );

    function addPostToTimeline(
        uint256 timelineGroup,
        uint256 timelineId,
        uint256 postId
    ) private {
        uint256[] storage timeline = timelines[timelineGroup][timelineId];
        timeline.push() = postId;
        emit TimelineAddPost(timelineGroup, timelineId, postId, msg.sender, timeline.length);
    }

    /* 
    ==========================
    Post
    ==========================
    */
    struct Post {
        address owner;
        uint256 timelineGroup;
        uint256 timelineId;
        uint256 timelinePostIndex;
        address contentPointer;
    }

    struct PostContent {
        bytes32 title;
        uint256 time;
        address[] mentions;
        bytes data;
    }

    /* INTERNAL TIMELINE GROUPS */
    uint256 public constant TIMELINE_GROUP_PROFILE_POSTS = 0;
    uint256 public constant TIMELINE_GROUP_PROFILE_REPLIES = 1;
    uint256 public constant TIMELINE_GROUP_PROFILE_MENTIONS = 2;
    uint256 public constant TIMELINE_GROUP_ALL = 3;
    uint256 public constant LAST_INTERNAL_TIMELINE_GROUP = 3;
    /* DEFAULT TIMELINE GROUPS */
    uint256 public constant TIMELINE_GROUP_REPLIES = 4;
    uint256 public constant TIMELINE_GROUP_TOPICS = 5;
    uint256 public constant LAST_DEFAULT_TIMELINE_GROUP = 5;

    event PostPublished(uint256 indexed blockNumber);

    Post[] public posts;

    function publishPost(
        uint256 timelineGroup,
        uint256 timelineId,
        bytes32 title,
        bytes calldata data,
        address[] calldata mentions
    ) external {
        require(timelineGroup > LAST_INTERNAL_TIMELINE_GROUP, "Can't post on internal timeline group.");

        uint256 timelineLength = timelines[timelineGroup][timelineId].length;
        uint256 postId = posts.length;
        posts.push() = Post(
            msg.sender,
            timelineGroup,
            timelineId,
            timelineLength,
            SSTORE2.write(abi.encode(PostContent(title, block.timestamp, mentions, data)))
        );

        addPostToTimeline(timelineGroup, timelineId, postId);
        addPostToTimeline(TIMELINE_GROUP_ALL, timelineGroup, postId);

        addPostToTimeline(
            timelineGroup == TIMELINE_GROUP_REPLIES ? TIMELINE_GROUP_PROFILE_REPLIES : TIMELINE_GROUP_PROFILE_POSTS,
            uint256(uint160(address(msg.sender))),
            postId
        );
        for (uint256 i = 0; i < mentions.length; i++) {
            addPostToTimeline(TIMELINE_GROUP_PROFILE_MENTIONS, uint256(uint160(address(mentions[i]))), postId);
        }

        emit PostPublished(block.number);
    }

    modifier onlyPostOwner(uint256 postId) {
        require(posts[postId].owner == msg.sender, "You don't own this post.");
        _;
    }

    /* 
    ==========================
    Post Edit
    ==========================
    */

    mapping(uint256 => address[]) public postContentHistory;

    event PostEdit(uint256 indexed postId, bytes32 title, bytes data, address[] mentions);

    function editPost(
        uint256 postId,
        bytes32 title,
        bytes calldata data,
        address[] calldata mentions
    ) external onlyPostOwner(postId) {
        Post storage postRef = posts[postId];
        postContentHistory[postId].push(postRef.contentPointer);
        postRef.contentPointer = SSTORE2.write(abi.encode(PostContent(title, block.timestamp, mentions, data)));
        emit PostEdit(postId, title, data, mentions);
    }

    /* 
    ==========================
    Post MetaData
    ==========================
    */

    mapping(uint256 => mapping(bytes32 => bytes32)) public postMetadatas;
    event PostMetadataSet(uint256 indexed postId, bytes32 key, bytes32 value, uint256 blockNumber);

    function setPostMetadata(
        uint256 postId,
        bytes32 key,
        bytes32 value
    ) public onlyPostOwner(postId) {
        postMetadatas[postId][key] = value;
        emit PostMetadataSet(postId, key, value, block.number);
    }

    /* 
    ==========================
    Get Post
    ==========================
    */

    struct PostData {
        uint256 postId;
        Post post;
        PostContent content;
        bytes32[2][] metadata;
    }

    function getPostContent(address contentPointer) private view returns (PostContent memory) {
        return abi.decode(SSTORE2.read(contentPointer), (PostContent));
    }

    function getTimelinePostData(
        uint256 timelineGroup,
        uint256 timelineId,
        uint256 postIndex,
        bytes32[2][] memory metadata
    ) external view returns (PostData memory) {
        uint256 postId = timelines[timelineGroup][timelineId][postIndex];

        Post memory post = posts[postId];
        PostContent memory content = getPostContent(posts[postId].contentPointer);

        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = postMetadatas[postId][metadata[i][0]];
        return PostData(postId, post, content, metadata);
    }

    function getPostData(uint256 postId, bytes32[2][] memory metadata) external view returns (PostData memory) {
        Post memory post = posts[postId];
        PostContent memory content = getPostContent(posts[postId].contentPointer);

        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = postMetadatas[postId][metadata[i][0]];
        return PostData(postId, post, content, metadata);
    }
}
