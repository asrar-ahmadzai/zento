
import { LocationForm } from "@/components/forms/create-location"
import { fetchApi } from "@/lib/api"

export async function createLocation(data: {
    name: string
    province: string
}) {
    const result = await fetchApi("location/", {
        method: "POST",
        body: {
            name: data.name,
            province: data.province,
        },
    })
    console.log("this is data from server side", data)

    return result
}
export async function deleteLocation(id: string) {
    return await fetchApi(`location/${id}/`, {
        method: "DELETE",
    })
}
export async function getLocation() {

    const res = await fetchApi("location/")
    return res
}
export async function UpdateLocation(id: string, data: LocationForm) {
    const res = await fetchApi(`location/${id}/`, {
        method: "PUT",
        body: data
    })
    return res
}
export const getLocations = async (
    page: number,
    pageSize: number
) => {
    const res = await fetchApi(
        `location/?page=${page}&page_size=${pageSize}`
    )

    return res
}
