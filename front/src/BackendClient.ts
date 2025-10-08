import { jwtDecode } from "jwt-decode";
import endpointConfig from './Configs/endpoints.config'
import { useNavigate } from "react-router-dom";

let isLoggedIn: boolean = false;

export async function postAnonymus(endpoint:string, data: any, responseHandler?: (response: Response) => void): Promise<any> {

    const response = await fetch(endpointConfig.BackendBaseUrl + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok){
        if (responseHandler !== undefined && !response.ok) {
            responseHandler(response);
        }
        else{
            const errorText = await response.text();
            throw new Error(`${response.status}, ${errorText}`);
        }
    }

    return await response.json();
}

export async function postAuthorized(endpoint: string, data: any, responseHandler? : (response: Response) => void): Promise<any> {

    //Validate token before making request, if token isnt valid redirect to /account/login
    if (!ValidateToken()) {
        const navigate = useNavigate();
        navigate("/account/login");
    }

    const response = await fetch(endpointConfig.BackendBaseUrl + endpoint, {
        method: "POST",
        headers: {
            "ContentType": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("JWT")}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        if (responseHandler !== undefined) {
            responseHandler(response);
        }
        else {
            const errorText = await response.text();
            throw new Error(`${response.status}, ${errorText}`);
        }
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