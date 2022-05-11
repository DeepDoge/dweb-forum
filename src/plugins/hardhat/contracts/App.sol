//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

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

    mapping(TimelineIdType => mapping(uint256 => Timeline)) timelines;
    enum TimelineIdType {
        Normal,
        Reply
    }
    struct TimelineId {
        TimelineIdType idType;
        uint256 id;
    }
    struct Timeline {
        PostLink[] postLinks;
        uint256 startIndex;
        uint256 endIndex;
    }
    struct PostLink {
        uint256 postIndex;
        uint256 beforePostIndex;
        uint256 afterPostIndex;
    }

    function _getTimeline(TimelineId memory timelineId) private view returns (Timeline storage) {
        return timelines[timelineId.idType][timelineId.id];
    }

    function getTimeline(TimelineId memory timelineId) public view returns (Timeline memory) {
        return timelines[timelineId.idType][timelineId.id];
    }

    function getTimelinePost(TimelineId memory timelineId, uint256 timelinePostIndex) public view returns (PostLink memory) {
        Timeline storage timeline = _getTimeline(timelineId);
        return timeline.postLinks[timelinePostIndex];
    }

    /* function bulkgetTimelinePost(TimelineId memory timelineId, uint256 timelinePostIndex, uint256 limit) public view returns (PostLink[] memory) {
        Timeline storage timeline = _getTimeline(timelineId);
        PostLink[] storage r;
        r.push() = timeline.postLinks[timelinePostIndex];
        while (r.length < limit)
        {
            
        }
        return timeline.postLinks;
    } */

    function timelineLength(TimelineId memory timelineId) public view returns (uint256) {
        return _getTimeline(timelineId).postLinks.length;
    }

    Post[] public posts;
    struct Post {
        uint256 index;
        string content; // can be a markdown, ipfs hash or anything else, parsed by client
        address owner;
        uint256 publishTime;
    }

    function postsLength() public view returns (uint256) {
        return posts.length;
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
        Timeline storage timeline = _getTimeline(timelineId);
        uint256 index = timeline.postLinks.length;
        timeline.postLinks.push() = PostLink(postIndex, timeline.endIndex, 0);
        timeline.postLinks[timeline.endIndex].afterPostIndex = index;
        timeline.endIndex = index;
    }

    function hidePostOnTimeline(TimelineId memory timelineId, uint256 postOnTimelineIndex) public {
        Timeline storage timeline = _getTimeline(timelineId);
        PostLink memory link = timeline.postLinks[postOnTimelineIndex];
        if (timeline.startIndex == postOnTimelineIndex) {
            timeline.startIndex = link.afterPostIndex;
        } else if (timeline.endIndex == postOnTimelineIndex) {
            timeline.endIndex = link.beforePostIndex;
        } else {
            timeline.postLinks[link.beforePostIndex].afterPostIndex = link.afterPostIndex;
            timeline.postLinks[link.afterPostIndex].beforePostIndex = link.beforePostIndex;
        }
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
