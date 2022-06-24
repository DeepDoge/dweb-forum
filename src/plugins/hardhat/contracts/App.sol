//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract App {
    /* 
    ==========================
    Profile
    ==========================
    */
    mapping(address => mapping(uint256 => uint256)) public profiles;
    event ProfileSet(address indexed owner, uint256 indexed key, uint256 value, uint256 timestamp);

    function setProfile(uint256 key, uint256 value) external {
        profiles[msg.sender][key] = value;
        emit ProfileSet(msg.sender, key, value, block.timestamp);
    }

    /* 
    ==========================
    Timeline
    ==========================
    */

    mapping(uint256 => mapping(uint256 => uint256[])) timelines;

    function timelineLength(uint256 group, uint256 id) external view returns (uint256) {
        return timelines[group][id].length;
    }

    event TimelineAddPost(uint256 indexed timelineGroup, uint256 indexed timelineId, uint256 postId, uint256 timelineLength, uint256 timestamp);

    function addPostToTimeline(
        uint256 timelineGroup,
        uint256 timelineId,
        uint256 postId
    ) private {
        uint256[] storage timeline = timelines[timelineGroup][timelineId];
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
        uint256 time;
        uint256 title;
        uint256[8] content;
        uint256 timelineGroup;
        uint256 timelineId;
    }

    uint256 public constant PUBLISH_GAS = 100;

    /* INTERNAL TIMELINE GROUPS */
    uint256 public constant TIMELINE_GROUP_PROFILE_POSTS = 0;
    uint256 public constant TIMELINE_GROUP_PROFILE_REPLIES = 1;
    uint256 public constant TIMELINE_GROUP_PROFILE_MENTIONS = 2;
    uint256 public constant LAST_INTERNAL_TIMELINE_GROUP = 2;
    uint256 public constant TIMELINE_GROUP_REPLIES = 3;
    uint256 public constant TIMELINE_GROUP_GROUPS = 4;
    uint256 public constant TIMELINE_GROUP_TOPICS = 5;
    uint256 public constant LAST_DEFAULT_TIMELINE_GROUP = 5;

    uint256 public postCounter = 0;

    function publishPost(
        uint256 timelineGroup,
        uint256 timelineId,
        uint256 title,
        uint256[8] calldata content,
        address[8] calldata profileMentions
    ) external payable {
        uint256 cost = tx.gasprice * PUBLISH_GAS;
        require(timelineGroup > LAST_INTERNAL_TIMELINE_GROUP, "Can't post on internal timeline group.");
        require(msg.value >= cost, "Not enough fee paid to post.");
        payable(msg.sender).transfer(msg.value - cost);

        uint256 postId = postCounter++;
        posts[postId] = Post(msg.sender, block.timestamp, title, content, timelineGroup, timelineId);

        addPostToTimeline(timelineGroup, timelineId, postId);
        addPostToTimeline(
            timelineGroup == TIMELINE_GROUP_REPLIES ? TIMELINE_GROUP_PROFILE_REPLIES : TIMELINE_GROUP_PROFILE_POSTS,
            uint256(uint160(address(msg.sender))),
            postId
        );

        for (uint256 i = 0; i < profileMentions.length; i++) {
            addPostToTimeline(TIMELINE_GROUP_PROFILE_MENTIONS, uint256(uint160(address(profileMentions[i]))), postId);
        }
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
        uint256[8] content;
        uint256 time;
    }

    event PostEdit(uint256 indexed postId, uint256[8] content, uint256 timestamp);

    function editPost(uint256 postId, uint256[8] calldata content) external onlyPostOwner(postId) {
        {
            Post memory post = posts[postId];
            postHistory[postId].push() = PostHistory(post.content, post.time);
        }

        {
            Post storage post = posts[postId];
            post.content = content;
            post.time = block.timestamp;
        }

        emit PostEdit(postId, content, block.timestamp);
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
    ) external onlyPostOwner(postIndex) {
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
    }

    function getTimelinePostData(
        uint256 timelineGroup,
        uint256 timelineId,
        uint256 postIndex
    ) external view returns (PostData memory) {
        uint256 postId = timelines[timelineGroup][timelineId][postIndex];
        return PostData(postId, posts[postId]);
    }

    function getPostData(uint256 postId) external view returns (PostData memory) {
        return PostData(postId, posts[postId]);
    }
}
