import { jwtDecode } from "jwt-decode";
import { decodeUserData, encodeUserData, type UserData as UserData } from "./types/userData";
import { ParseToken as rftDecode } from "./types/refreshToken";
import { postAnonymous } from "./BackendClient";

let loggedIn: boolean = false;
let activeUserData: UserData | undefined;

export function getActiveUser(): UserData | undefined {
    return activeUserData;
}

export function isLoggedIn(): boolean {
    return loggedIn;
}

export async function logOut() {
    await cookieStore.delete('access');
    await cookieStore.delete('refresh');

    loggedIn = false;
    activeUserData = undefined;
}

export async function getJWT(): Promise<string | null> {

    const isLoginValid = await validateLogin();
    if (!isLoginValid) return null;

    const accessToken = await cookieStore.get('access');
    return accessToken!.value!;
}

export async function validateLogin(): Promise<boolean> {
    
    const access = await isAccessValid();
    if (!access) {
        const success = await refreshLogin();

        if (!success) return false;
    }

    loggedIn = true;
    const userCookie = await cookieStore.get('user');
    activeUserData = decodeUserData(userCookie!.value!);

    return true;
}

export async function requestJWToken(loginDetails: LoginRequest, handler?: (e: unknown) => void): Promise<boolean> {
    try {
        const data = await postAnonymous<LoginResult>('user/Login', loginDetails);
        await processLoginResult(data);
        return true;
    }
    catch(e) {
        if(handler) handler(e);
        return false;
    }
}

export async function refreshLogin(): Promise<boolean> {

    const refreshCookie = await cookieStore.get('refresh');
    if(!refreshCookie) return false;

    try {
        const data = await postAnonymous<LoginResult>('user/RefreshLogin', { "token": refreshCookie.value!});
        await processLoginResult(data);
        return true;
    }
    catch (e) {
        return false;
    }
}

async function isAccessValid(): Promise<boolean> {
    const accessCookie = await cookieStore.get('access');
    if (!accessCookie) return false;

    const jwt = jwtDecode(accessCookie.value!);

    const expSeconds = jwt.exp! * 1000;
    const isValid = expSeconds > Date.now();

    return isValid;
}

async function processLoginResult(data: LoginResult) {
    
    const jwt = jwtDecode(data.accessToken);
    const rft = rftDecode(data.refreshToken);
    
    await cookieStore.set({
        name: "access",
        value: data.accessToken,
        expires: jwt.exp! * 1000,
        path: '/',
    });

    await cookieStore.set({
        name: "refresh",
        value: data.refreshToken,
        expires: rft.expiration * 1000,
        path: '/',
    });

    await cookieStore.set({
        name: "user",
        value: encodeUserData(data.userData),
        path: '/'
    });

    loggedIn = true;
    activeUserData = data.userData;
}

type LoginResult = {
    accessToken: string,
    refreshToken: string,
    userData: UserData
}

export type LoginRequest = {
    email: string,
    password: string
}