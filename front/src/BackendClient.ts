export async function sendData(endpoint:string, data: any): Promise<any> {
    console.log(JSON.stringify(data));

    const response = await fetch("http://localhost:5111/api/User/CreateUser" + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok){
        throw new Error(`Request to back end failed: ${response.status}`);
    }

    return await response.json();
}