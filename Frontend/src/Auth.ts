import { jwtDecode } from "jwt-decode";
import type { userData } from "./types/userData";

let isLoggedIn: boolean = false;
let activeUserData: userData | undefined = undefined;

export function SetJWToken(token: string) {
    localStorage.setItem("JWT", token);
    isLoggedIn = true;
}

export function SetActiveUser(user: userData) {
    localStorage.setItem("activeUserData", JSON.stringify(user));
    activeUserData = user;
}

export function ValidateToken(): boolean {
    
    const token = localStorage.getItem("JWT");

    if (token === null) return false;

    const decodedToken = jwtDecode(token);
    
    if (decodedToken.exp === undefined) return false;
    
    
    const expirationSeconds = decodedToken.exp * 1000;
    const isValid = expirationSeconds > Date.now();
    console.log(`exp: ${expirationSeconds} now: ${Date.now()}`);

    if (!isValid) return false;

    isLoggedIn = true;

    return true;
}

export function IsLoggedIn(): boolean {
    return isLoggedIn;
}

export function GetCurrentActiveUser(): userData | undefined {
    //Check if the current session has the active user already defined
    if (activeUserData === undefined) {

        //If not read the local storage to see if we have data about the user stored
        const readActiveUserData = localStorage.getItem("activeUserData");

        //If not we have no info about the user, return undefined
        if (readActiveUserData === null) {
            return undefined;
        }

        //If its defined parse the JSON and set the current instance of activeUserData to it
        SetActiveUser(JSON.parse(readActiveUserData));
    }

    //Return the set active user data
    return activeUserData;
}

export function LogOutUser() {
    activeUserData = undefined;
    isLoggedIn = false;

    localStorage.clear();
}

export function GetJWT(): string {
    return(localStorage.getItem('JWT') ?? '');
}