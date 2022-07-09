//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.15;

import "./SSTORE.sol";

contract App {
    /* 
    ==========================
    Timeline
    ==========================
    */

    mapping(uint256 => address[]) public timelines;

    function getTimelineId(uint96 timelineGroup, uint160 timelineKey) private pure returns (uint256) {
        return (uint256(timelineGroup) >> 160) | timelineKey;
    }

    function getTimelineLength(uint96 timelineGroup, uint160 timelineKey) external view returns (uint256) {
        return timelines[getTimelineId(timelineGroup, timelineKey)].length;
    }

    event TimelineAddPost(uint256 indexed timelineId, address postId, address owner, uint256 timelineLength);

    mapping(address => mapping(uint160 => bool)) public mentionIndex;

    function addPostToTimeline(
        uint96 timelineGroup,
        uint160 timelineKey,
        address postId
    ) private {
        if (timelineGroup == TIMELINE_GROUP_PROFILE_MENTIONS) {
            mapping(uint160 => bool) storage postMentionIndex = mentionIndex[postId];
            if (postMentionIndex[timelineKey]) return;
            postMentionIndex[timelineKey] = true;
        }

        uint256 timelineId = getTimelineId(timelineGroup, timelineKey);
        address[] storage timeline = timelines[timelineId];
        timeline.push() = postId;
        emit TimelineAddPost(timelineId, postId, msg.sender, timeline.length);
    }

    /* 
    ==========================
    Post
    ==========================
    */
    struct Post {
        uint96 timelineGroup;
        uint160 timelineKey;
        uint256 timelinePostIndex;
        address contentPointer;
        address owner;
    }

    struct PostContent {
        bytes32 title;
        uint256 time;
        address[] mentions;
        bytes data;
    }

    /* INTERNAL TIMELINE GROUPS */
    uint96 public constant TIMELINE_GROUP_PROFILE_POSTS = 0;
    uint96 public constant TIMELINE_GROUP_PROFILE_REPLIES = 1;
    uint96 public constant TIMELINE_GROUP_PROFILE_MENTIONS = 2;
    uint96 public constant TIMELINE_GROUP_ALL = 3;
    uint96 public constant LAST_INTERNAL_TIMELINE_GROUP = 3;
    /* DEFAULT TIMELINE GROUPS */
    uint96 public constant TIMELINE_GROUP_REPLIES = 4;
    uint96 public constant TIMELINE_GROUP_TOPICS = 5;
    uint96 public constant LAST_DEFAULT_TIMELINE_GROUP = 5;

    event PostPublished(uint256 indexed blockNumber);

    mapping(address => Post) posts;

    function publishPost(
        uint96 timelineGroup,
        uint160 timelineKey,
        bytes32 title,
        bytes calldata data,
        address[] calldata mentions
    ) external {
        require(timelineGroup > LAST_INTERNAL_TIMELINE_GROUP, "Can't post on internal timeline group.");

        uint256 timelineId = getTimelineId(timelineGroup, timelineKey);
        uint256 timelineLength = timelines[timelineId].length;

        // First content pointer is also the postId
        // content pointer can change but postId stays the same
        address contentPointer = SSTORE2.write(abi.encode(PostContent(title, block.timestamp, mentions, data)));

        posts[contentPointer] = Post(timelineGroup, timelineKey, timelineLength, contentPointer, msg.sender);

        addPostToTimeline(timelineGroup, timelineKey, contentPointer);
        addPostToTimeline(TIMELINE_GROUP_ALL, timelineGroup, contentPointer);

        addPostToTimeline(
            timelineGroup == TIMELINE_GROUP_REPLIES ? TIMELINE_GROUP_PROFILE_REPLIES : TIMELINE_GROUP_PROFILE_POSTS,
            uint160(address(msg.sender)),
            contentPointer
        );

        for (uint256 i = 0; i < mentions.length; i++)
            addPostToTimeline(TIMELINE_GROUP_PROFILE_MENTIONS, uint160(address(mentions[i])), contentPointer);

        emit PostPublished(block.number);
    }

    modifier onlyPostOwner(address postId) {
        require(posts[postId].owner == msg.sender, "You don't own this post.");
        _;
    }

    /* 
    ==========================
    Post Edit
    ==========================
    */

    mapping(address => address[]) public postContentHistory;

    event PostEdit(address indexed postId, bytes32 title, bytes data, address[] mentions);

    function editPost(
        address postId,
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

    mapping(address => mapping(bytes32 => bytes32)) public postMetadatas;
    event PostMetadataSet(address indexed postId, bytes32 key, bytes32 value, uint256 blockNumber);

    function setPostMetadata(
        address postId,
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
        address postId;
        Post post;
        PostContent content;
        bytes32[2][] metadata;
    }

    function getPostContent(address contentPointer) private view returns (PostContent memory) {
        return abi.decode(SSTORE2.read(contentPointer), (PostContent));
    }

    function getTimelinePostData(
        uint96 timelineGroup,
        uint160 timelineKey,
        uint256 postIndex,
        bytes32[2][] memory metadata
    ) external view returns (PostData memory) {
        uint256 timelineId = getTimelineId(timelineGroup, timelineKey);
        address postId = timelines[timelineId][postIndex];

        Post memory post = posts[postId];
        PostContent memory content = getPostContent(posts[postId].contentPointer);

        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = postMetadatas[postId][metadata[i][0]];
        return PostData(postId, post, content, metadata);
    }

    function getPostData(address postId, bytes32[2][] memory metadata) external view returns (PostData memory) {
        Post memory post = posts[postId];
        PostContent memory content = getPostContent(posts[postId].contentPointer);

        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = postMetadatas[postId][metadata[i][0]];
        return PostData(postId, post, content, metadata);
    }
}
