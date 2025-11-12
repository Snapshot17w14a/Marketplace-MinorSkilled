export type RefreshToken = {
    tokenId: string,
    userId: string,
    expiration: number
}

export function ParseToken(tokenString: string): RefreshToken {

    const decoded = atob(tokenString)
    const content = decoded.split('.');

    const token: RefreshToken = {
        tokenId: content[0],
        userId: content[1],
        expiration: Number.parseInt(content[2])
    }

    return token;
}