import endpointConfig from './Configs/endpoints.config'
import { getJWT, validateLogin } from './Auth';
import { FetchError } from './classes/FetchError';

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
            throw new FetchError(response.status, errorText);
        }
    }

    if (response.status === 204) {
        return undefined as unknown as T;
    }
    const result = await response.json() as T;
    return result;
}

export async function postAuthorized(endpoint: string, data: any, responseHandler? : (response: Response) => void): Promise<Response> {

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
            throw new FetchError(response.status, errorText);
        }
    }

    return response
}

export async function getAnonymous<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpointConfig.BackendBaseUrl + endpoint, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new FetchError(response.status, errorText);
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
        throw new FetchError(response.status, errorText);
    }

    const data = await response.json() as T;
    return data;
}

export async function postXmlHttp<T>(endpoint: string, formData: FormData, onProgress?: (ev: ProgressEvent) => void, headers: [{key: string, value: string}] | undefined = undefined): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.open("POST", endpointConfig.BackendBaseUrl + endpoint);

        const jwt = await getJWT();
        xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);

        if (headers !== undefined) {
            headers.forEach(header => {
                xhr.setRequestHeader(header.key, header.value);
            });
        }

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