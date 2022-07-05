import { BigNumber } from "ethers";

export function stringAsBytes(value: string): Uint8Array
{
    return new Uint8Array(value.split('').map((char) => char.codePointAt(0)))
}

export function bytesAsString(bytes: Uint8Array): string
{
    return String.fromCodePoint(...bytes)
}

export function bigNumberAsBytes(value: BigNumber): Uint8Array
{
    if (value.eq(0)) return new Uint8Array();
    let hex = value.toBigInt().toString(16);
    if (hex.length % 2) hex = "0" + hex;

    const binaryNumbers: number[] = [];
    for (let i = 0; i < hex.length; i += 2) binaryNumbers.push(parseInt(hex.slice(i, i + 2), 16));
    const bytes = Uint8Array.from(binaryNumbers)

    return bytes
}

export function bytesAsBigNumber(bytes: Uint8Array): BigNumber
{
    return BigNumber.from(bytes)
}

export function decodeBytesFromBigNumber(value: BigNumber): Uint8Array
{
    return bigNumberAsBytes(value).slice(1)
}

export function encodeBytesToBigNumber(bytes: Uint8Array): BigNumber 
{
    if (bytes.length === 0) return BigNumber.from(0)
    return BigNumber.from(new Uint8Array([1, ...bytes]))
}

export function stringAsBigNumber(value: string)
{
    if (!value) return BigNumber.from(0)
    return encodeBytesToBigNumber(stringAsBytes(value));
}

export function stringAsUint256(value: string)
{
    if (!value) return BigNumber.from(0)
    const bytes = stringAsBytes(value)
    if (bytes.length > 32) throw new Error(`Max byte size is 32. Size of "${value}" is ${bytes.length}`) // 8 bit * 32 = 256 bits. so its same as uint256 in solidity
    return encodeBytesToBigNumber(bytes);
}

export function bigNumberAsString(number: BigNumber): string
{
    if (number.eq(0)) return null
    return bytesAsString(decodeBytesFromBigNumber(number))
}

export function stringAsUint256Array(value: string)
{
    const bytes = stringAsBytes(value)
    return bytesAsUint256Array(bytes)
}

export function bytesAsUint256Array(bytes: Uint8Array): BigNumber[]
{
    const result: BigNumber[] = []
    const byteSize = 31; // 8 bit * (31 + 1(bigNumberPrefix)) = 256 bits. so its same as uint256 in solidity
    for (let i = 0; true; i++)
    {
        const start = i * byteSize
        const desiredEnd = start + byteSize;
        const end = Math.min(bytes.length, desiredEnd)
        const slice = bytes.slice(start, end)
        result.push(encodeBytesToBigNumber(slice))
        if (end === bytes.length) break
    }

    while (result.length < 8) // in the contract length of uint256 array is 8. so its uint256[8]. we fill the slots left in the array with 0s 
        result.push(BigNumber.from(0))

    return result
}

export function bigNumberArrayAsBytes(arr: BigNumber[]): Uint8Array
{
    const byteNumbers: number[] = []
    arr.forEach((bytes) => decodeBytesFromBigNumber(bytes).forEach((byte) => byteNumbers.push(byte)))
    return Uint8Array.from(byteNumbers)
}

export function bigNumberArrayAsString(arr: BigNumber[]): string
{
   return bytesAsString(bigNumberArrayAsBytes(arr))
}
