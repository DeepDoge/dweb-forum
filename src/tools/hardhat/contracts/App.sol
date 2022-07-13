//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.15;

import "./SSTORE2.sol";

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
    mapping(uint256 => uint160[]) public timelines;

    function getTimelineId(uint96 timelineGroup, uint160 timelineKey) private pure returns (uint256) {
        return (uint256(timelineGroup) << 160) | timelineKey;
    }

    function getTimelineLengh(uint256 timelineId) external view returns (uint256) {
        return timelines[timelineId].length;
    }

    event TimelineAddPost(uint256 indexed timelineId, uint160 postId, address owner, uint256 timelineLength);

    function addPostToTimeline(uint256 timelineId, uint160 postId) private {
        uint160[] storage timeline = timelines[timelineId];
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
        address owner;
        address contentPointer;
    }

    struct PostContent {
        uint256 time;
        address[] mentions;
        bytes data;
    }

    mapping(uint160 => Post) public posts;
    uint160 postCounter;
    
    function publishPost(
        uint96 timelineGroup,
        uint160 timelineKey,
        bytes calldata data,
        address[] calldata mentions
    ) external {
        require(timelineGroup > LAST_INTERNAL_TIMELINE_GROUP, "Can't post on internal timeline group.");

        uint160 postId = postCounter++;
        address contentPointer = SSTORE2.write(abi.encode(PostContent(block.timestamp, mentions, data)));
        posts[postId] = Post(timelineGroup, timelineKey, msg.sender, contentPointer);

        if (timelineGroup != 0 && timelineKey != 0) {
            addPostToTimeline(getTimelineId(timelineGroup, timelineKey), postId);
            addPostToTimeline(getTimelineId(TIMELINE_GROUP_ALL, timelineGroup), postId);
        }

        addPostToTimeline(
            getTimelineId(
                timelineGroup == TIMELINE_GROUP_REPLIES ? TIMELINE_GROUP_PROFILE_REPLIES : TIMELINE_GROUP_PROFILE_POSTS,
                uint160(address(msg.sender))
            ),
            postId
        );

        for (uint256 i = 0; i < mentions.length; i++)
            addPostToTimeline(getTimelineId(TIMELINE_GROUP_PROFILE_MENTIONS, uint160(address(mentions[i]))), postId);
    }

    modifier onlyPostOwner(uint160 postId) {
        require(posts[postId].owner == msg.sender, "You don't own this post.");
        _;
    }

    /* 
    ==========================
    Post Edit
    ==========================
    */
    mapping(uint160 => address[]) public postContentHistory;

    function editPost(
        uint160 postId,
        bytes calldata data,
        address[] calldata mentions
    ) external onlyPostOwner(postId) {
        Post storage post = posts[postId];
        postContentHistory[postId].push(post.contentPointer);
        post.contentPointer = SSTORE2.write(abi.encode(PostContent(block.timestamp, mentions, data)));
    }

     /* 
    ==========================
    Get PostData
    ==========================
    */
    struct PostData
    {
        uint160 postId;
        Post post;
        PostContent postContent;
        bytes32[][] metadata;
    }

    function getPostData(uint160 postId, bytes32[][] memory metadata) external view returns (PostData memory)
    {
        for (uint256 i = 0; i < metadata.length; i++)
            metadata[i][1] = postMetadatas[postId][metadata[i][0]];

        Post memory post = posts[postId];
        PostData memory postData = PostData(postId, post, abi.decode(SSTORE2.read(post.contentPointer), (PostContent)), metadata);

        return postData;
    }

    function getPostDataFromTimeline(uint256 timelineId, uint256 postIndex, bytes32[][] memory metadata) external view returns (PostData memory)
    {
        uint160 postId = timelines[timelineId][postIndex];

        for (uint256 i = 0; i < metadata.length; i++)
            metadata[i][1] = postMetadatas[postId][metadata[i][0]];

        Post memory post = posts[postId];
        PostData memory postData = PostData(postId, post, abi.decode(SSTORE2.read(post.contentPointer), (PostContent)), metadata);

        return postData;
    }

    /* 
    ==========================
    Post MetaData
    ==========================
    */
    mapping(uint160 => mapping(bytes32 => bytes32)) public postMetadatas;
    event PostMetadataSet(uint160 indexed postId, bytes32 key, bytes32 value);

    function setPostMetadata(
        uint160 postId,
        bytes32 key,
        bytes32 value
    ) public onlyPostOwner(postId) {
        postMetadatas[postId][key] = value;
        emit PostMetadataSet(postId, key, value);
    }
}
