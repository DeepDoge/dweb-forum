// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./extensions/ERC721UriGetter.sol";
import "./extensions/PostsExternal.sol";
import "./utils/Base64.sol";

contract UriGetterV0 is ERC721UriGetter, PostsExternal {
    using Strings for uint256;
    using Strings for uint96;
    using Strings for uint160;

    constructor(address postsContractAddress) PostsExternal(postsContractAddress) {}

    function _attributes(uint256 tokenId) private view returns(string memory) {
        Post memory post = _getPost(uint160(tokenId));
        PostContent memory content = _getContent(post.contentPointer);
        return string(
                abi.encodePacked(
                    '[',
                    '{"display_type": "number","trait_type":"Byte Size","value":', content.data.length.toString(), '},',
                    '{"display_type": "date","trait_type":"Publish Date","value":', content.time.toString(), '},',
                    '{"trait_type":"Timeline Group","value":"', post.timelineGroup.toString(), '"},',
                    '{"trait_type":"Timeline Key","value":"', post.timelineKey.toString(), '"}',
                    ']'
                )
            );
    }

    function tokenURI(uint256 tokenId) external view override returns (string memory) {
        string memory tokenIdString = tokenId.toString();
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(string(abi.encodePacked(
                        '{"name":', '"Post #', tokenIdString, '",', 
                        '"description":', '"Decenterlized Forum Post #', tokenIdString, '",',  
                        '"image_data":', '"ipfs://QmY12M6ds8d4RRXgEFqW8sycoQM582coZ6aB9cVvs4mJ7o",', 
                        '"external_url":', '"ipns://dforum.eth/#137##', tokenIdString, '",'
                        '"attributes":', _attributes(tokenId), 
                        '}')))
                )
            );
    }

    function contractURI() external pure override returns (string memory) {
        return "";
    }
}
