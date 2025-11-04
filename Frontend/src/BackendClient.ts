import endpointConfig from './Configs/endpoints.config'
import { getJWT, validateLogin } from './Auth';

export async function postAnonymous<T>(endpoint: string, data: any, responseHandler?: (response: Response) => void): Promise<any> {

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

    const result = await response.json() as T;
    return result;
}

export async function postAuthorized(endpoint: string, data: any, responseHandler? : (response: Response) => void): Promise<any> {

    if (!validateLogin()) {
        throw new Error("Auth expired");
    }

    const response = await fetch(endpointConfig.BackendBaseUrl + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${await getJWT()}`
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

    response.text
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

    if (!validateLogin()) {
        throw new Error("Auth expired");
    }

    const response = await fetch(endpointConfig.BackendBaseUrl + endpoint, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${await getJWT()}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}, ${errorText}`)
    }

    const data = await response.json() as T;
    return data;
}

export async function postXmlHttp<T>(endpoint: string, formData: FormData, onProgress?: (ev: ProgressEvent) => void): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.open("POST", endpointConfig.BackendBaseUrl + endpoint);

        const jwt = await getJWT();
        xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);

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