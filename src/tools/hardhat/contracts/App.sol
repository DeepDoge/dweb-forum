//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.15;

contract App {

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

    /* 
    ==========================
    Timeline
    ==========================
    */

    mapping(uint256 => uint256) public timelineLengths;

    function getTimelineId(uint96 timelineGroup, uint160 timelineKey) private pure returns (uint256) {
        return (uint256(timelineGroup) << 160) | timelineKey;
    }

    function getTimelineLength(uint96 timelineGroup, uint160 timelineKey) external view returns (uint256) {
        return timelineLengths[getTimelineId(timelineGroup, timelineKey)];
    }

    event TimelineAddPost(uint256 indexed timelineId, uint256 indexed postIndex, address postId, address owner);

    function addPostToTimeline(
        uint96 timelineGroup,
        uint160 timelineKey,
        address postId
    ) private {
        uint256 timelineId = getTimelineId(timelineGroup, timelineKey);
        emit TimelineAddPost(timelineId, timelineLengths[timelineId]++, postId, msg.sender);
    }

    /* 
    ==========================
    Post
    ==========================
    */

    struct PostInfo {
        uint256 postBlockPointer;
        uint256 postContentBlockPointer;
        address owner;
    }

    struct Post {
        uint96 timelineGroup;
        uint160 timelineKey;
        uint256 timelinePostIndex;
    }

    struct PostContent {
        bytes32 title;
        uint256 time;
        address[] mentions;
        bytes data;
    }

    event PostPublished(address indexed postId, Post post);
    event PostContentPublished(address indexed postId, PostContent postContent);

    mapping(address => PostInfo) public postInfos;
    uint160 public postCounter = 1;

    function publishPost(
        uint96 timelineGroup,
        uint160 timelineKey,
        bytes32 title,
        bytes calldata data,
        address[] calldata mentions
    ) external returns (address) {
        require(timelineGroup > LAST_INTERNAL_TIMELINE_GROUP, "Can't post on internal timeline group.");

        uint256 timelineLength = timelineLengths[getTimelineId(timelineGroup, timelineKey)];

        address postId = address(postCounter++);
        postInfos[postId] = PostInfo(block.number, block.number, msg.sender);

        emit PostPublished(postId, Post(timelineGroup, timelineKey, timelineLength));
        emit PostContentPublished(postId, PostContent(title, block.timestamp, mentions, data));

        addPostToTimeline(timelineGroup, timelineKey, postId);
        addPostToTimeline(TIMELINE_GROUP_ALL, timelineGroup, postId);

        addPostToTimeline(
            timelineGroup == TIMELINE_GROUP_REPLIES ? TIMELINE_GROUP_PROFILE_REPLIES : TIMELINE_GROUP_PROFILE_POSTS,
            uint160(address(msg.sender)),
            postId
        );

        for (uint256 i = 0; i < mentions.length; i++) addPostToTimeline(TIMELINE_GROUP_PROFILE_MENTIONS, uint160(address(mentions[i])), postId);

        return postId;
    }

    modifier onlyPostOwner(address postId) {
        require(postInfos[postId].owner == msg.sender, "You don't own this post.");
        _;
    }

    /* 
    ==========================
    Post Edit
    ==========================
    */
    mapping(address => uint256[]) public postContentHistory;

    function editPost(
        address postId,
        bytes32 title,
        bytes calldata data,
        address[] calldata mentions
    ) external onlyPostOwner(postId) {
        PostInfo storage postInfo = postInfos[postId];
        postContentHistory[postId].push(postInfo.postContentBlockPointer);

        postInfo.postContentBlockPointer = block.number;
        emit PostContentPublished(postId, PostContent(title, block.timestamp, mentions, data));
    }

    /* 
    ==========================
    Post MetaData
    ==========================
    */
    mapping(address => mapping(bytes32 => bytes32)) public postMetadatas;
    event PostMetadataSet(address indexed postId, bytes32 key, bytes32 value);

    function setPostMetadata(
        address postId,
        bytes32 key,
        bytes32 value
    ) public onlyPostOwner(postId) {
        postMetadatas[postId][key] = value;
        emit PostMetadataSet(postId, key, value);
    }
}
