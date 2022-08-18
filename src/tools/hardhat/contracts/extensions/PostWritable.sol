//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PostReadable.sol";

abstract contract PostWritable is PostReadable {
    function _setContent(PostContent memory postContent) internal returns (address) {
        return SSTORE2.write(abi.encode(postContent));
    }
}
