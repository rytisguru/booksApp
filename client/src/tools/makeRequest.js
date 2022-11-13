import axios from "axios"

export async function makeRequest(url) {
    return await axios.get(process.env.REACT_APP_SERVER_URL + url)
    .then(response => {
        if (response.data !== null) {
            return response.data[0]
        }
        return null
    })
}