const API_URL = "http://127.0.0.1:8000/app/"

type ApiOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: any
}

export async function fetchApi<T = any>(
    endpoint = "",
    options: ApiOptions = {}
): Promise<T> {
    const { method = "GET", body } = options
    console.log("+++++++++++++++++++++")
    console.log("url", API_URL, endpoint)
    console.log("+++++++++++++++++++++")
    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
    }

    // DELETE may return an empty response
    if (response.status === 204) {
        return null as T
    }

    return response.json()
}