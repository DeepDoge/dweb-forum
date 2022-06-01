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

    event TimelineAddPost(uint256 indexed timelineGroup, uint256 indexed timelineId, uint256 postId, uint256 timestamp);
    function addPostToTimeline(uint256 timelineGroup, uint256 timelineId, uint256 postId) private {
        timelines[timelineGroup][timelineId].push() = postId;
        emit TimelineAddPost(timelineGroup, timelineId, postId, block.timestamp);
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
        uint256[8] content;
    }

    uint256 public constant PUBLISH_GAS = 100;
    uint256 public constant PROFILE_TIMELINE_GROUP = 0;

    uint256 public postCounter = 0;
    function publishPost(uint256 timelineGroup, uint256 timelineId, uint256[8] calldata content) external payable {
        uint256 cost = tx.gasprice * PUBLISH_GAS;
        require(timelineGroup > 0, "Can't post on internal timeline group.");
        require(msg.value >= cost, "Not enough fee paid to post.");
        payable(msg.sender).transfer(msg.value - cost);

        uint256 postId = postCounter++;
        posts[postId] = Post(msg.sender, block.timestamp, content);

        addPostToTimeline(timelineGroup, timelineId, postId);
        addPostToTimeline(PROFILE_TIMELINE_GROUP, uint256(uint160(address(msg.sender))), postId);
    }

    modifier onlyPostOwner(uint256 postId)
    {
        require(posts[postId].owner == msg.sender, "You don't own this post.");
        _;
    }

    /* 
    ==========================
    Post Edit
    ==========================
    */

    mapping(uint256 => PostHistory[]) public postHistory;
    struct PostHistory
    {
        uint256[8] content;
        uint256 time;
    }

    event PostEdit(uint256 indexed postId, uint256[8] content, uint256 timestamp);
    function editPost(uint256 postId, uint256[8] calldata content) external onlyPostOwner(postId)
    {
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
    function setPostMetadata(uint256 postIndex, uint256 key, uint256 value) external onlyPostOwner(postIndex)
    {
        postMetadatas[postIndex][key] = value;
        emit PostMetadataSet(postIndex, key, value, block.timestamp);
    }

    /* 
    ==========================
    Get Post
    ==========================
    */

    struct PostData
    {
        uint256 id;
        Post post;
    }
    function getTimelinePostData(uint256 timelineGroup, uint256 timelineId, uint256 postIndex) external view returns (PostData memory) {
        uint256 postId = timelines[timelineGroup][timelineId][postIndex];
        return PostData(postId, posts[postId]);
    }
    function getPostData(uint256 postId) external view returns (PostData memory)
    {
        return PostData(postId, posts[postId]);
    }
}
