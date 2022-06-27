//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract App {
    /* 
    ==========================
    Timeline
    ==========================
    */

    mapping(uint256 => mapping(uint256 => uint256[])) timelines;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => uint256[2]))) postIdToPostIndexOnTimelineMap;

    function timelineLength(uint256 group, uint256 id) external view returns (uint256) {
        return timelines[group][id].length;
    }

    event TimelineAddPost(uint256 indexed timelineGroup, uint256 indexed timelineId, uint256 postId, uint256 timelineLength, uint256 timestamp);

    function addPostToTimeline(
        uint256 timelineGroup,
        uint256 timelineId,
        uint256 postId
    ) private {
        uint256[2] storage postIndexMap = postIdToPostIndexOnTimelineMap[timelineGroup][timelineId][postId];

        // Stop duplicate
        if (postIndexMap[1] == 1) return;
        uint256[] storage timeline = timelines[timelineGroup][timelineId];
        postIndexMap[0] = timeline.length;
        postIndexMap[1] = 1;

        // Add post to timeline
        timeline.push() = postId;
        emit TimelineAddPost(timelineGroup, timelineId, postId, timeline.length, block.timestamp);
    }

    /* 
    ==========================
    Post
    ==========================
    */

    mapping(uint256 => Post) public posts;
    struct Post {
        address owner;
        uint256 timelineGroup;
        uint256 timelineId;
        uint256 time;
        uint256 title;
        uint256[8] content;
        address[8] mentions;
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

    uint256 public postCounter = 1;

    event PostPublished(uint256 indexed blockNumber, uint256 postId);

    function publishPost(
        uint256 timelineGroup,
        uint256 timelineId,
        uint256 title,
        uint256[8] calldata content,
        address[8] calldata mentions
    ) external {
        require(timelineGroup > LAST_INTERNAL_TIMELINE_GROUP, "Can't post on internal timeline group.");

        uint256 postId = postCounter++;
        posts[postId] = Post(msg.sender, timelineGroup, timelineId, block.timestamp, title, content, mentions);

        addPostToTimeline(timelineGroup, timelineId, postId);
        addPostToTimeline(
            timelineGroup == TIMELINE_GROUP_REPLIES ? TIMELINE_GROUP_PROFILE_REPLIES : TIMELINE_GROUP_PROFILE_POSTS,
            uint256(uint160(address(msg.sender))),
            postId
        );
        addPostToTimeline(TIMELINE_GROUP_ALL, timelineGroup, postId);

        for (uint256 i = 0; i < mentions.length; i++) {
            if (mentions[i] == address(0)) break;
            addPostToTimeline(TIMELINE_GROUP_PROFILE_MENTIONS, uint256(uint160(address(mentions[i]))), postId);
        }

        emit PostPublished(block.number, postId);
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

    mapping(uint256 => PostHistory[]) public postHistory;
    struct PostHistory {
        uint256 time;
        uint256 title;
        uint256[8] content;
        address[8] mentions;
    }

    event PostEdit(uint256 indexed postId, uint256 title, uint256[8] content, address[8] mentions, uint256 time);

    function editPost(
        uint256 postId,
        uint256 title,
        uint256[8] calldata content,
        address[8] calldata mentions
    ) external onlyPostOwner(postId) {
        {
            Post memory post = posts[postId];
            postHistory[postId].push() = PostHistory(post.time, post.title, post.content, post.mentions);
        }

        {
            Post storage post = posts[postId];
            post.time = block.timestamp;
            post.title = title;
            post.content = content;
            post.mentions = mentions;
        }

        emit PostEdit(postId, title, content, mentions, block.timestamp);
    }

    /* 
    ==========================
    Post MetaData
    ==========================
    */

    mapping(uint256 => mapping(uint256 => uint256)) public postMetadatas;
    event PostMetadataSet(uint256 indexed postIndex, uint256 indexed key, uint256 value, uint256 timestamp);

    function setPostMetadata(
        uint256 postIndex,
        uint256 key,
        uint256 value
    ) public onlyPostOwner(postIndex) {
        postMetadatas[postIndex][key] = value;
        emit PostMetadataSet(postIndex, key, value, block.timestamp);
    }

    /* 
    ==========================
    Get Post
    ==========================
    */

    struct PostData {
        uint256 id;
        Post post;
        uint256[2][] metadata;
    }

    function getTimelinePostData(
        uint256 timelineGroup,
        uint256 timelineId,
        uint256 postIndex,
        uint256[2][] memory metadata
    ) external view returns (PostData memory) {
        uint256 postId = timelines[timelineGroup][timelineId][postIndex];
        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = postMetadatas[postId][metadata[i][0]];
        return PostData(postId, posts[postId], metadata);
    }

    function getPostData(uint256 postId, uint256[2][] memory metadata) external view returns (PostData memory) {
        for (uint256 i = 0; i < metadata.length; i++) metadata[i][1] = postMetadatas[postId][metadata[i][0]];
        return PostData(postId, posts[postId], metadata);
    }
}
