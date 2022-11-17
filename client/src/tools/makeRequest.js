export async function makeRequest(url) {
    const data = await fetch(process.env.REACT_APP_SERVER_URL + url);
    return await data.json();
}