import { jwtDecode } from "jwt-decode";

let isLoggedIn: boolean = false;

export async function sendData(endpoint:string, data: any, responseHandler?: (response: Response) => void): Promise<any> {
    console.log(JSON.stringify(data));

    const response = await fetch("http://localhost:5111/api/" + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if(responseHandler != null && !response.ok){
        responseHandler(response);
    }

    else if (!response.ok){
        throw new Error(`Request to back end failed: ${response.status}`);
    }

    return await response.json();
}

export function SetJWToken(token: string) {
    sessionStorage.setItem("JWT", token);
    isLoggedIn = true;
}

export function ValidateToken(): boolean {
    
    const token = sessionStorage.getItem("JWT");

    if (token === null) return false;

    const decodedToken = jwtDecode(token);

    if (decodedToken.exp === undefined) return false;

    return decodedToken.exp < Date.now();
}