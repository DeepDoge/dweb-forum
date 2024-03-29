//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./libs/SSTORE2.sol";
import "./extensions/PostWritable.sol";

contract Posts is PostWritable {
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
    function _getPost(uint160 postId) internal view override returns (Post memory) {
        return posts[postId];
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
        address contentPointer = _setContent(PostContent(block.timestamp, mentions, data));
        posts[postId] = Post(timelineGroup, timelineKey, msg.sender, contentPointer);

        if (!(timelineGroup == 0 && timelineKey == 0)) {
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
}
