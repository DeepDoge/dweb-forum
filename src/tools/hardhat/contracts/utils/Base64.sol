// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Base64 {
    bytes private constant base64stdchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    function encode(string memory _str) internal pure returns (string memory) {
        uint256 i = 0; // Counters & runners
        uint256 j = 0;

        uint256 padlen = bytes(_str).length; // Lenght of the input string "padded" to next multiple of 3
        if (padlen % 3 != 0) padlen += (3 - (padlen % 3));

        bytes memory _bs = bytes(_str);
        bytes memory _ms = new bytes(padlen); // extra "padded" bytes in _ms are zero by default
        // copy the string
        for (i = 0; i < _bs.length; i++) {
            // _ms = input string + zero padding
            _ms[i] = _bs[i];
        }

        uint256 res_length = (padlen / 3) * 4; // compute the length of the resulting string = 4/3 of input
        bytes memory res = new bytes(res_length); // create the result string

        for (i = 0; i < padlen; i += 3) {
            uint256 c0 = uint256(uint8(_ms[i])) >> 2;
            uint256 c1 = ((uint256(uint8(_ms[i])) & 3) << 4) | (uint256(uint8(_ms[i + 1])) >> 4);
            uint256 c2 = ((uint256(uint8(_ms[i + 1])) & 15) << 2) | (uint256(uint8(_ms[i + 2])) >> 6);
            uint256 c3 = (uint256(uint8(_ms[i + 2])) & 63);

            res[j] = base64stdchars[c0];
            res[j + 1] = base64stdchars[c1];
            res[j + 2] = base64stdchars[c2];
            res[j + 3] = base64stdchars[c3];

            j += 4;
        }

        // Adjust trailing empty values
        if ((padlen - bytes(_str).length) >= 1) {
            res[j - 1] = base64stdchars[64];
        }
        if ((padlen - bytes(_str).length) >= 2) {
            res[j - 2] = base64stdchars[64];
        }
        return string(res);
    }

    function decode(string memory _str) internal pure returns (string memory) {
        require((bytes(_str).length % 4) == 0, "Length not multiple of 4");
        bytes memory _bs = bytes(_str);

        uint256 i = 0;
        uint256 j = 0;
        uint256 dec_length = (_bs.length / 4) * 3;
        bytes memory dec = new bytes(dec_length);

        for (; i < _bs.length; i += 4) {
            (dec[j], dec[j + 1], dec[j + 2]) = dencode4(bytes1(_bs[i]), bytes1(_bs[i + 1]), bytes1(_bs[i + 2]), bytes1(_bs[i + 3]));
            j += 3;
        }
        while (dec[--j] == 0) {}

        bytes memory res = new bytes(j + 1);
        for (i = 0; i <= j; i++) res[i] = dec[i];

        return string(res);
    }

    function dencode4(
        bytes1 b0,
        bytes1 b1,
        bytes1 b2,
        bytes1 b3
    )
        private
        pure
        returns (
            bytes1 a0,
            bytes1 a1,
            bytes1 a2
        )
    {
        uint256 pos0 = charpos(b0);
        uint256 pos1 = charpos(b1);
        uint256 pos2 = charpos(b2) % 64;
        uint256 pos3 = charpos(b3) % 64;

        a0 = bytes1(uint8(((pos0 << 2) | (pos1 >> 4))));
        a1 = bytes1(uint8((((pos1 & 15) << 4) | (pos2 >> 2))));
        a2 = bytes1(uint8((((pos2 & 3) << 6) | pos3)));
    }

    function charpos(bytes1 char) private pure returns (uint256 pos) {
        for (; base64stdchars[pos] != char; pos++) {} //for loop body is not necessary
        require(base64stdchars[pos] == char, "Illegal char in string");
        return pos;
    }
}
