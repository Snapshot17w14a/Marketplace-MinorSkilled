export type UserData = {
    email: string,
    username: string,
    guid: string
}

export function decodeUserData(dataString: string): UserData {
    const decoded = atob(dataString);

    const content = decoded.split(',');

    const user: UserData = {
        email: content[0],
        username: content[1],
        guid: content[2]
    };

    return user;
}

export function encodeUserData(user: UserData): string {
    const csv = `${user.email},${user.username},${user.guid}`;

    const encoded = btoa(csv);

    return encoded;
}