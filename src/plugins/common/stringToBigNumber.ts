import { BigNumber } from "ethers";

function BytesToString(bytes: Uint8Array)
{
    const utf8Decoder = new TextDecoder()
    return utf8Decoder.decode(bytes);
}

function stringToBytes(value: string)
{
    const utf8Encode = new TextEncoder();
    return utf8Encode.encode(value) 
}

export function stringToBigNumber(value: string)
{
    if (!value) return BigNumber.from(0)
    const bytes = stringToBytes(value)
    if (bytes.length > 32) throw new Error(`Max byte size is 32. Size of "${value}" is ${bytes.length}`) // 8 bit * 32 = 256 bits. so its same as uint256 in solidity
    return BigNumber.from(bytes);
}

export function bigNumberToBytes(value: BigNumber)
{
    if (value.eq(0)) return null;
    let hex = value.toBigInt().toString(16);
    if (hex.length % 2) hex = "0" + hex;

    const binaryNumbers: number[] = [];
    for (let i = 0; i < hex.length; i += 2) binaryNumbers.push(parseInt(hex.slice(i, i + 2), 16));
    const bytes = Uint8Array.from(binaryNumbers)

    return bytes
}

export function encodeStringToBigNumberArray(value: string)
{
    const bytes = stringToBytes(value)
    const result: BigNumber[] = []
    const byteSize = 32; // 8 bit * 32 = 256 bits. so its same as uint256 in solidity
    for (let i = 0; true; i++)
    {
        const start = i * byteSize
        const desiredEnd = start + byteSize;
        const end = Math.min(bytes.length, desiredEnd)
        result.push(BigNumber.from(bytes.slice(start, end)))
        if (end !== desiredEnd) break
    }

    while (result.length < 8)
        result.push(BigNumber.from(0))

    return result
}

export function decodeBigNumberArrayToString(arr: BigNumber[])
{
    const byteNumbers: number[] = []
    arr.filter((number) => number.gt(0)).forEach((bytes) => bigNumberToBytes(bytes).forEach((byte) => byteNumbers.push(byte)))
    return BytesToString(Uint8Array.from(byteNumbers))
}