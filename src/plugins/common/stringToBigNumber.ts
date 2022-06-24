import { BigNumber } from "ethers";

export function stringToBigNumber(value: string)
{
    if (!value) return BigNumber.from(0)
    return BigNumber.from(Uint8Array.from(value, (char) => char.charCodeAt(0)));
}

export function bigNumberToString(value: BigNumber)
{
    if (value.eq(0)) return null;
    let hex = value.toBigInt().toString(16);
    if (hex.length % 2) hex = "0" + hex;

    const binary = [];
    for (let i = 0; i < hex.length; i += 2) binary.push(String.fromCharCode(parseInt(hex.slice(i, i + 2), 16)));

    return binary.join("");
}

export function encodePostContent(value: string)
{
    const result: BigNumber[] = []
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0))
    const byteSize = 32;
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

export function decodePostContent(arr: BigNumber[])
{
    return arr.filter((number) => number.gt(0)).map((number) => bigNumberToString(number)).join("")
}