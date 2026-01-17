// import { jwtDecode } from "jwt-decode";
// import { type UserData } from "./types/userData";
// import { ParseToken as rftDecode } from "./types/refreshToken";
// import { getAnonymous, getAuthorized, postAnonymous } from "./BackendClient";
// import { Event } from "./classes/Event";

// export let loggedIn: boolean = false;
// export let activeUserData: UserData | undefined;
// export let userRole: string | undefined;
// export let authToken: string | undefined;

// export const onLogin: Event<UserData> = new Event<UserData>();
// export const onLogout: Event<{}> = new Event<{}>();

// export function getActiveUser(): UserData | undefined {
//     return activeUserData;
// }

// export function getUserRole(): string | undefined {
//     return userRole;
// }

// export function isLoggedIn(): boolean {
//     return loggedIn;
// }

// export async function logOut() {
//     await cookieStore.delete('access');
//     await cookieStore.delete('refresh');
//     await cookieStore.delete('user');

//     loggedIn = false;
//     activeUserData = undefined;
//     userRole = undefined;
//     authToken = undefined;

//     onLogout.invoke({});
// }

// export async function getJWT(): Promise<string> {

//     const isLoginValid = await validateLogin();
//     if (!isLoginValid) return '';

//     const accessToken = await cookieStore.get('access');
//     return accessToken!.value!;
// }

// export async function validateLogin(): Promise<boolean> {
    
//     const access = await isAccessValid();
//     if (!access) {
//         const success = await refreshLogin();

//         if (!success){
//             //window.location.href = '/account/login';
//             return false;
//         }
//     }

//     loggedIn = true;
//     const userCookie = await cookieStore.get('user');
//     activeUserData = JSON.parse(userCookie!.value!);

//     const accessCookie = await cookieStore.get('access');
//     authToken = accessCookie!.value!;

//     return true;
// }

// export async function requestJWToken(loginDetails: LoginRequest, allowThrowing: boolean = false): Promise<boolean> {
//     try {
//         const data = await postAnonymous<LoginResult>('users/Login', loginDetails);
//         await processLoginResult(data);
//         return true;
//     }
//     catch(e) {
//         if (allowThrowing) throw e;
        
//         return false;
//     }
// }

// export async function request2FASecret(): Promise<string> {
//     const data = await getAuthorized<{key: string}>('users/enable2fa');
//     return data.key;
// }

// export async function refreshLogin(): Promise<boolean> {

//     const refreshCookie = await cookieStore.get('refresh');
//     if(!refreshCookie) return false;

//     try {
//         const data = await postAnonymous<LoginResult>('users/RefreshLogin', { "token": refreshCookie.value! });
//         await processLoginResult(data);
//         return true;
//     }
//     catch (e) {

//         logOut();

//         return false;
//     }
// }

// async function isAccessValid(): Promise<boolean> {
//     const accessCookie = await cookieStore.get('access');
//     if (!accessCookie) return false;

//     const jwt = jwtDecode(accessCookie.value!);

//     const expSeconds = jwt.exp! * 1000;
//     const isValid = expSeconds > Date.now();

//     return isValid;
// }

// async function processLoginResult(data: LoginResult) {
    
//     const jwt = jwtDecode(data.accessToken);
//     const rft = rftDecode(data.refreshToken);

//     var response = await getAnonymous<{ role: string }>(`users/GetUserRole/${jwt.sub!}`);
//     userRole = response.role;
//     data.userData.role = userRole;
    
//     await cookieStore.set({
//         name: "access",
//         value: data.accessToken,
//         expires: jwt.exp! * 1000,
//         path: '/',
//     }); 

//     await cookieStore.set({
//         name: "refresh",
//         value: data.refreshToken,
//         expires: rft.expiration * 1000,
//         path: '/',
//     });

//     await cookieStore.set({
//         name: "user",
//         value: JSON.stringify(data.userData),
//         path: '/'
//     });

//     loggedIn = true;
//     activeUserData = data.userData;
//     authToken = data.accessToken;

//     onLogin.invoke(data.userData);  
// }

// type LoginResult = {
//     accessToken: string,
//     refreshToken: string,
//     userData: UserData,
// }

// export type LoginRequest = {
//     email: string,
//     password: string,
//     totp?: string
// }