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
        walletToNicknameMap[msg.sender] = nickname;
        emit NicknameClaimed(msg.sender, nickname);
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
        return timelines[timelineId.group][timelineId.id];
    }

    function getTimeline(TimelineId memory timelineId) public view returns (Timeline memory) {
        return timelines[timelineId.group][timelineId.id];
    }

    function getTimelinePost(TimelineId memory timelineId, uint256 timelinePostIndex) public view returns (PostLink memory) {
        Timeline storage timeline = _getTimeline(timelineId);
        return timeline.postLinks[timelinePostIndex];
    }

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
        addPostToTimeline(TimelineId(TimelineGroup.Profile, uint256(uint160(address(msg.sender)))), index);
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
}
