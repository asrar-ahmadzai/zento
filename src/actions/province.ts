import { fetchApi } from "@/lib/api"

export const getprovinces = async () => {
    const res = await fetchApi("province/")
    return res?.results
}