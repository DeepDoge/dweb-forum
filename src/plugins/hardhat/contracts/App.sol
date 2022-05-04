//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract App {
    mapping(address => string) public walletToNameMap;
    mapping(string => address) nameToWalletMap;

    event NameClaimed(address indexed owner, string name);

    function claimName(string memory name) public {
        require(
            bytes(name).length <= 64,
            "Length can't be longer than 64 ASCII characters."
        );
        require(nameToWalletMap[name] == address(0x0), "Already claimed.");

        string memory currentName = walletToNameMap[msg.sender];
        if (bytes(currentName).length > 0) delete nameToWalletMap[currentName];

        walletToNameMap[msg.sender] = name;
        nameToWalletMap[name] = msg.sender;
        emit NameClaimed(msg.sender, name);
    }

    Post[] public posts;

    function postsLength() public view returns (uint256) {
        return posts.length;
    }

    mapping(address => uint256[]) public ownerTimeline;

    function ownerTimelineLength(address owner) public view returns (uint256) {
        return ownerTimeline[owner].length;
    }

    struct Post {
        uint256 id;
        string content; // can be a markdown or anything else, parsed by client
        address owner;
    }

    uint256 public constant PUBLISH_GAS = 100;

    function publishPost(string memory content) public payable {
        uint256 cost = tx.gasprice * PUBLISH_GAS;
        require(msg.value >= cost, "Not enough fee paid to post.");
        payable(msg.sender).transfer(msg.value - cost);
        ownerTimeline[msg.sender].push() = posts.length;
        posts.push() = Post(posts.length, content, msg.sender);
    }

    struct TopTag {
        string tag;
        uint256 score;
    }

    uint256 constant TOP_TAG_COUNT = 4;

    mapping(uint256 => mapping(string => uint256)) public postTagScore;
    mapping(uint256 => TopTag[TOP_TAG_COUNT]) public topTagsOfPost;
    mapping(string => mapping(uint256 => bool)) public tagTimelineIncludes;
    mapping(string => uint256[]) public tagTimeline;

    function addTagToPost(
        uint256 postId,
        string memory tag,
        bool calculateForTopTags
    ) public payable {
        require(postId < posts.length, "Post doesn't exist.");
        uint256 score = postTagScore[postId][tag] + msg.value;
        postTagScore[postId][tag] = score;

        if (calculateForTopTags) {
            uint256 topTagIndex = TOP_TAG_COUNT;
            uint256 i = TOP_TAG_COUNT - 1;
            uint256 next;
            TopTag memory nextTopTag;
            TopTag memory topTag;
            while (i >= 0) {
                next = i - 1;
                nextTopTag = topTagsOfPost[postId][next];

                if (score > topTag.score) {
                    topTagIndex = i;
                    if (score > nextTopTag.score)
                        topTagsOfPost[postId][i] = nextTopTag;
                    else break;
                } else break;

                i = next;
                topTag = nextTopTag;
            }

            if (topTagIndex < TOP_TAG_COUNT) {
                topTagsOfPost[postId][topTagIndex] = TopTag(tag, score);

                if (!tagTimelineIncludes[tag][postId]) {
                    tagTimeline[tag].push() = postId;
                    tagTimelineIncludes[tag][postId] = true;
                }
            }
        }
    }
}
