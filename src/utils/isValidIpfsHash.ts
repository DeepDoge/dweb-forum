const exampleQm = 'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH'
const examplebafy = 'bafybeif7ztnhq65lumvvtr4ekcwd2ifwgm3awq4zfr3srh462rwyinlb4y'
export function isValidIpfsHash(hash: string)
{
    return (exampleQm.length === hash.length && hash.startsWith('Qm')) ||
        (examplebafy.length === hash.length && hash.startsWith('bafy'))
}