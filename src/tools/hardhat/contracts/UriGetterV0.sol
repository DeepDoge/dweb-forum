// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./extensions/ERC721UriGetter.sol";
import "./extensions/PostReadableExternal.sol";
import "./utils/Base64.sol";

contract UriGetterV0 is ERC721UriGetter, PostReadableExternal {
    using Strings for uint256;
    using Strings for uint96;
    using Strings for uint160;

    constructor(address postsContractAddress) PostReadableExternal(postsContractAddress) {}

    function _getChainID() private view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    function _attributes(uint256 tokenId) private view returns(string memory) {
        Post memory post = _getPost(uint160(tokenId));
        PostContent memory content = _getContent(post.contentPointer);
        return string(
            abi.encodePacked(
                '[',
                    /* '{"display_type": "number","trait_type":"Byte Size","value":', content.data.length.toString(), '},', */
                    '{"display_type":"number","trait_type":"Bytes","value":', content.data.length.toString(), '},',
                    '{"display_type":"date","trait_type":"Publish Date","value":', content.time.toString(), '},',
                    '{"trait_type":"Timeline Group","value":"', post.timelineGroup.toString(), '"},',
                    '{"trait_type":"Timeline Key","value":"', post.timelineKey.toString(), '"}',
                ']'
            )
        );
    }

    function _svg(string memory tokenIdString) private pure returns(string memory) {
        return string(
            abi.encodePacked("<svg width='500' height='500' viewPort='0 0 500 500' xmlns='http://www.w3.org/2000/svg'><rect style='fill:url(#g);width:500px;height:500px'/><text font-size='45' style='fill:#fff;font-family:sans-serif;font-weight:bold'><tspan x='14' y='390'>Post</tspan><tspan x='14' y='450'>#", tokenIdString, "</tspan></text><defs><linearGradient id='g' x1='0' x2='500' gradientUnits='userSpaceOnUse'><stop stop-color='#8360C3'/><stop offset='1' stop-color='#208B69'/></linearGradient></defs></svg>")
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
                        '"image_data":', '"', _svg(tokenIdString), '",', 
                        '"external_url":', '"https://dforum.eth.link/#', _getChainID().toString(), '##', tokenIdString, '",'
                        '"attributes":', _attributes(tokenId), 
                        '}')))
                )
            );
    }

    function contractURI() external pure override returns (string memory) {
        return "ipfs://QmdJxFRCuFoxoP3XgdzTftkwrfmWYUzQHT6AqvFaWWS9ZQ";
    }
}
