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

    struct PostInfo {
        uint256 postBlockPointer;
        uint256 postContentBlockPointer;
        address owner;
    }

    struct Post {
        uint96 timelineGroup;
        uint160 timelineKey;
    }

    struct PostContent {
        bytes32 title;
        uint256 time;
        address[] mentions;
        bytes data;
    }

    event PostPublished(uint160 indexed postId, Post post);
    event PostContentPublished(uint160 indexed postId, PostContent postContent);

    mapping(uint160 => PostInfo) public postInfos;
    uint160 public postCounter = 1;

    function publishPost(
        uint96 timelineGroup,
        uint160 timelineKey,
        bytes32 title,
        bytes calldata data,
        address[] calldata mentions
    ) external {
        require(timelineGroup > LAST_INTERNAL_TIMELINE_GROUP, "Can't post on internal timeline group.");

        uint160 postId = postCounter++;
        postInfos[postId] = PostInfo(block.number, block.number, msg.sender);

        emit PostPublished(postId, Post(timelineGroup, timelineKey));
        emit PostContentPublished(postId, PostContent(title, block.timestamp, mentions, data));

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
        require(postInfos[postId].owner == msg.sender, "You don't own this post.");
        _;
    }

    /* 
    ==========================
    Post Edit
    ==========================
    */
    mapping(uint160 => uint256[]) public postContentHistory;

    function editPost(
        uint160 postId,
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
