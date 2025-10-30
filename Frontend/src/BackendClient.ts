import endpointConfig from './Configs/endpoints.config'
import { useNavigate } from "react-router-dom";
import { GetJWT, ValidateToken } from './Auth';

export async function postAnonymous(endpoint: string, data: any, responseHandler?: (response: Response) => void): Promise<any> {

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
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GetJWT()}`
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

export async function getAnonymous<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpointConfig.BackendBaseUrl + endpoint, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}, ${errorText}`)
    }

    const data = await response.json() as T;
    return data;
}

export async function getAuthorized<T>(endpoint: string): Promise<T> {

    if (!ValidateToken()) {
        throw new Error("Auth expired");
    }

    const response = await fetch(endpointConfig.BackendBaseUrl + endpoint, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${GetJWT()}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}, ${errorText}`)
    }

    const data = await response.json() as T;
    return data;
}

export function postXmlHttp<T>(endpoint: string, formData: FormData, onProgress?: (ev: ProgressEvent) => void): Promise<T> {
    return new Promise<T>((resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.open("POST", endpointConfig.BackendBaseUrl + endpoint);

        xhr.setRequestHeader("Authorization", `Bearer ${GetJWT()}`);

        if (onProgress){
            xhr.upload.onprogress = onProgress;
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300){
                try {
                    const jsonResponse = JSON.parse(xhr.responseText) as T;
                    resolve(jsonResponse);
                }
                catch (error) {
                    reject(error);
                }
            }
            else {
                reject(`Code: ${xhr.status}`);
            }
        }

        xhr.onerror = () => {
            reject("Network error!");
        }

        xhr.send(formData);
    });
}