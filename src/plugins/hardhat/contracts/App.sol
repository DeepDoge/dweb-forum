//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract App {
    mapping(address => string) public walletToNicknameMap;
    event NicknameClaimed(address indexed owner, string nickname);

    function claimNickname(string memory nickname) public {
        require(
            bytes(nickname).length <= 64,
            "Length can't be longer than 64 ASCII characters."
        );
        walletToNicknameMap[msg.sender] = nickname;
        emit NicknameClaimed(msg.sender, nickname);
    }

    struct Post {
        uint256 id;
        string content; // can be a markdown or anything else, parsed by client
        address owner;
        uint256 publishTime;
    }
    Post[] public posts;

    function postsLength() public view returns (uint256) {
        return posts.length;
    }

    mapping(address => uint256[]) public ownerTimeline;

    function ownerTimelineLength(address owner) public view returns (uint256) {
        return ownerTimeline[owner].length;
    }

    uint256 public constant PUBLISH_GAS = 100;

    function publishPost(string memory content) public payable {
        uint256 cost = tx.gasprice * PUBLISH_GAS;
        require(msg.value >= cost, "Not enough fee paid to post.");
        payable(msg.sender).transfer(msg.value - cost);
        ownerTimeline[msg.sender].push() = posts.length;
        posts.push() = Post(posts.length, content, msg.sender, block.timestamp);
    }

    mapping(uint256 => mapping(string => uint256)) public postTagScore;

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
                    for (uint256 x = TOP_TAG_COUNT - 1; x > rank; x--)
                        topTagsOfPost[postId][x] = topTagsOfPost[postId][x - 1];
                    topTagsOfPost[postId][rank] = TopTag(tag, score);
                    break;
                }
    }
}
