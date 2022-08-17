//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./ERC721UriGetter.sol";

abstract contract ERC721UriExternal is Ownable, ERC721Enumerable {
    ERC721UriGetter internal _uriGetter;

    constructor(address uriGetterAddress) {
        _setUriGetterAddress(uriGetterAddress);
    }

    function _setUriGetterAddress(address uriGetterAddress) private {
        _uriGetter = ERC721UriGetter(uriGetterAddress);
    }

    function setUriGetterAddress(address uriGetterAddress) external onlyOwner {
        _setUriGetterAddress(uriGetterAddress);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        return _uriGetter.tokenURI(tokenId);
    }

    function contractURI() public view virtual returns (string memory) {
        return _uriGetter.contractURI();
    }
}
