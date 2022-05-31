//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract App {
    /* 
    ==========================
    Profile
    ==========================
    */
    mapping(address => mapping(uint256 => string)) public profiles;
    event ProfileSet(address indexed owner, uint256 indexed key, string value, uint256 timestamp);

    function setProfile(uint256 key, string memory value) public {
        profiles[msg.sender][key] = value;
        emit ProfileSet(msg.sender, key, value, block.timestamp);
    }

    /* 
    ==========================
    Post
    ==========================
    */

    mapping(TimelineGroup => mapping(uint256 => Timeline)) timelines;
    enum TimelineGroup {
        Normal,
        Reply,
        Profile
    }
    struct TimelineId {
        TimelineGroup group;
        uint256 id;
    }
    struct Timeline {
        uint256[] postIndexes;
    }


    function _getTimeline(TimelineId memory timelineId) private view returns (Timeline storage) {
        return timelines[timelineId.group][timelineId.id];
    }

    function getTimeline(TimelineId memory timelineId) public view returns (Timeline memory) {
        return timelines[timelineId.group][timelineId.id];
    }

    struct PostData
    {
        Post post;
        ContentData content;
    }
    function getTimelinePost(TimelineId memory timelineId, uint256 timelineIndex) public view returns (PostData memory) {
        Timeline storage timeline = _getTimeline(timelineId);
        Post memory post = posts[timeline.postIndexes[timelineIndex]];
        ContentData[] storage history = postContentHistory[post.index];
        return PostData(post, history[history.length - 1]);
    }

    function timelineLength(TimelineId memory timelineId) public view returns (uint256) {
        return _getTimeline(timelineId).postIndexes.length;
    }

    Post[] public posts;
    struct Post {
        uint256 index;
        address owner;
    }
    function postsLength() public view returns (uint256) {
        return posts.length;
    }

    mapping(uint256 => ContentData[]) postContentHistory;
    struct ContentData {
        string content; // can be a markdown, ipfs hash or anything else, parsed by client
        uint256 publishTime; 
    }
    function postContentHistoryLength(uint256 postIndex) public view returns (uint256)
    {
        return postContentHistory[postIndex].length;
    }

    uint256 public constant PUBLISH_GAS = 100;

    function publishPost(TimelineId memory timelineId, string memory content) public payable {
        uint256 cost = tx.gasprice * PUBLISH_GAS;
        require(msg.value >= cost, "Not enough fee paid to post.");
        payable(msg.sender).transfer(msg.value - cost);

        uint256 index = posts.length;
        posts.push() = Post(index, msg.sender);
        editPost(index, content);

        addPostToTimeline(timelineId, index);
        addPostToTimeline(TimelineId(TimelineGroup.Profile, uint256(uint160(address(msg.sender)))), index);
    }

    modifier onlyPostOwner(uint256 postIndex)
    {
        Post storage post = posts[postIndex];
        require(post.owner == msg.sender, "You don't own this post.");
        _;
    }

    event PostEdit(uint256 indexed postIndex, ContentData content, uint256 timestamp);
    function editPost(uint256 postIndex, string memory content) public onlyPostOwner(postIndex)
    {
        ContentData memory contentData = ContentData(content, block.timestamp);
        postContentHistory[postIndex].push() = contentData;
        emit PostEdit(postIndex, contentData, block.timestamp);
    }

    mapping(uint256 => mapping(uint256 => string)) postMetadatas;
    event PostMetadataSet(uint256 indexed postIndex, uint256 indexed key, string value, uint256 timestamp);
    function setPostMetadata(uint256 postIndex, uint256 key, string memory value) public onlyPostOwner(postIndex)
    {
        postMetadatas[postIndex][key] = value;
        emit PostMetadataSet(postIndex, key, value, block.timestamp);
    }

    event TimelineAddPost(TimelineId indexed timelineId, uint256 indexed postIndex, uint256 timestamp);
    function addPostToTimeline(TimelineId memory timelineId, uint256 postIndex) private {
        Timeline storage timeline = _getTimeline(timelineId);
        timeline.postIndexes.push() = postIndex;
        emit TimelineAddPost(timelineId, postIndex, block.timestamp);
    }
}
