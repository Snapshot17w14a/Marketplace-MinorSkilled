import endpointConfig from './Configs/endpoints.config'
import { FetchError } from './classes/FetchError';

let globalAuthToken: string | null = null;

export function setGlobalAuthToken(authToken: string) {
    globalAuthToken = authToken;
}

// ---------- Authorized fetches ----------

export async function postAuthorized(endpoint: string, data: any): Promise<Response> {

    return fetchAuthorized(endpoint, "POST", data);

}

export async function patchAuthorized(endpoint: string, data: any): Promise<Response> {

    return fetchAuthorized(endpoint, "PATCH", data);

}

export async function getAuthorized<T>(endpoint: string): Promise<T> {

    const response = await fetchAuthorized(endpoint, "GET");

    const data = await response.json() as T;
    return data;
}

async function fetchAuthorized(endpoint: string, method: string, data?: any): Promise<Response> {

    if (!globalAuthToken)
        throw new Error('Auth token not set');

    const response = await fetch(endpointConfig.BackendBaseUrl + endpoint, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${globalAuthToken}`
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const errorText = await response.text();
        throw new FetchError(response.status, errorText);
    }

    return response
}

// ---------- Anonymous fetches ----------

export async function postAnonymous<T>(endpoint: string, data: any): Promise<any> {

    const response = await fetchAnonymous(endpoint, "POST", data);

    if (response.status === 204) {
        return undefined as unknown as T;
    }
    const result = await response.json() as T;
    return result;
}

export async function getAnonymous<T>(endpoint: string): Promise<T> {

    return (await fetchAnonymous(endpoint, "GET")).json() as T;

}

async function fetchAnonymous(endpoint: string, method: string, data?: any): Promise<Response> {

    const response = await fetch(endpointConfig.BackendBaseUrl + endpoint, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new FetchError(response.status, errorText);
    }

    return response;
}

// ---------- XML fetches ----------

export async function postXmlHttp<T>(endpoint: string, formData: FormData, onProgress?: (ev: ProgressEvent) => void, headers: [{key: string, value: string}] | undefined = undefined): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.open("POST", endpointConfig.BackendBaseUrl + endpoint);

        xhr.setRequestHeader("Authorization", `Bearer ${globalAuthToken}`);

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