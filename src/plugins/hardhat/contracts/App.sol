//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.13;

contract App {
    /* 
    ==========================
    Nickname
    ==========================
    */
    mapping(address => string) public walletToNicknameMap;
    event NicknameClaimed(address indexed owner, string nickname);

    function claimNickname(string memory nickname) public {
        require(bytes(nickname).length <= 64, "Length can't be longer than 64 ASCII characters.");
        walletToNicknameMap[msg.sender] = nickname;
        emit NicknameClaimed(msg.sender, nickname);
    }

    /* 
    ==========================
    Post
    ==========================
    */
    Post[] public posts;
    struct Post {
        uint256 id;
        string content; // can be a markdown, ipfs hash or anything else, parsed by client
        address owner;
        uint256 publishTime;
    }

    function postsLength() public view returns (uint256) {
        return posts.length;
    }

    mapping(TimelineIdType => mapping(uint256 => TimelinePost[])) timelines;
    enum TimelineIdType
    {
        Normal,
        Reply
    }
    struct TimelineId
    {
        TimelineIdType idType;
        uint256 id;
    }
    function getTimeline(TimelineId memory timelineId) private view returns (TimelinePost[] storage)
    {
        return timelines[timelineId.idType][timelineId.id];
    }
    struct TimelinePost {
        uint256 postIndex;
        uint256 beforePostIndex;
        uint256 afterPostIndex;
    }

    function timelineLength(TimelineId memory timelineId) public view returns (uint256) {
        return getTimeline(timelineId).length;
    }

    uint256 public constant PUBLISH_GAS = 100;

    function publishPost(TimelineId memory timelineId, string memory content) public payable {
        uint256 cost = tx.gasprice * PUBLISH_GAS;
        require(msg.value >= cost, "Not enough fee paid to post.");
        payable(msg.sender).transfer(msg.value - cost);

        uint256 index = posts.length;
        posts.push() = Post(index, content, msg.sender, block.timestamp);
        addPostToTimeline(timelineId, index);
    }

    function addPostToTimeline(TimelineId memory timelineId, uint256 postIndex) private {
        TimelinePost[] storage timeline = getTimeline(timelineId);
        uint256 index = timeline.length;
        timeline.push() = TimelinePost(postIndex, index - 1, 0);
        timeline[index - 1].afterPostIndex = index;
    }

    function hidePostOnTimeline(TimelineId memory timelineId, uint256 postOnTimelineIndex) public {
        TimelinePost[] storage timeline = getTimeline(timelineId);
        require(posts[timeline[postOnTimelineIndex].postIndex].owner == msg.sender, "You are not the owner.");
        if (postOnTimelineIndex > 0) timeline[postOnTimelineIndex - 1].afterPostIndex = timeline[postOnTimelineIndex].afterPostIndex;
        if (postOnTimelineIndex < timeline.length - 1)
            timeline[postOnTimelineIndex + 1].beforePostIndex = timeline[postOnTimelineIndex].beforePostIndex;
    }

    /* 
    ==========================
    Tag
    ==========================
    */
/*     mapping(uint256 => mapping(string => uint256)) public postTagScore;

    mapping(string => uint256[]) public tagTimeline;
    mapping(string => mapping(uint256 => bool)) public tagTimelineIncludes;

    struct TopTag {
        string tag;
        uint256 score;
    }

    uint256 public constant TOP_TAG_COUNT = 4;
    mapping(uint256 => TopTag[TOP_TAG_COUNT]) public topTagsOfPost;

    function addTagToPost(
        uint256 postId,
        string memory tag,
        bool calculateForTopTags
    ) public payable {
        require(postId < posts.length, "Post doesn't exist.");
        uint256 score = postTagScore[postId][tag] + msg.value;
        postTagScore[postId][tag] = score;

        if (calculateForTopTags)
            for (uint256 rank = 0; rank < TOP_TAG_COUNT; rank++)
                if (score > topTagsOfPost[postId][rank].score) {
                    for (uint256 x = TOP_TAG_COUNT - 1; x > rank; x--) topTagsOfPost[postId][x] = topTagsOfPost[postId][x - 1];
                    topTagsOfPost[postId][rank] = TopTag(tag, score);
                    break;
                }
    } */
}
