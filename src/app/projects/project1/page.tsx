"use client"
import { deleteLocation, getLocation, getLocations, UpdateLocation } from "@/actions/location";
import { locationColumns } from "@/components/columns/location-column";
import AdvancedTable from "@/components/custom/hr-advanced-table";
import CreateLocation from "@/components/forms/create-location";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Location } from "@/typs/Location";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";



export default function Project1() {


    const [editLocation, setEditLocation] = useState<Location>({
        name: "",
        province: '',
        description: "",
        id: "",

    })


    const [paginationState, setPaginationState] = useState({
        pageIndex: 0,
        pageSize: 5,
    })

    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)
    const { data, isLoading, error } = useQuery({
        queryFn: () => getLocations(paginationState.pageIndex + 1, paginationState.pageSize),
        queryKey: ["locations", paginationState.pageIndex, paginationState.pageSize]

    })



    const handleChange = (pageI: number, pageS: number) => {
        setPaginationState({ pageIndex: pageI, pageSize: pageS })
    }
    const onEdit = (location: Location) => {
        setEditLocation({ ...location })
        console.log("editlocation", editLocation)
        setIsOpen(true)
    }

    const onCreate = () => {
        setEditLocation({
            name: "",
            province: "",
            description: "",
            id: "",
        })

        setIsOpen(true)

    }

    // useEffect(() => {


    // }, [editLocation])
    const { mutate: onDelete } = useMutation({
        mutationFn: deleteLocation,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["locations"]
            })
        }

    })
    if (isLoading) {
        return <Spinner />
    }
    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div>
            <div className="flex items-center justify-between mx-10 my-4">
                <h1>projec 1</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={onCreate}>
                            Create
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editLocation.id ? "Edit Location" : "Create Location"}
                            </DialogTitle>
                        </DialogHeader>

                        <CreateLocation
                            name={editLocation.name}
                            province={editLocation.province}
                            description={editLocation.description}
                            id={editLocation.id}
                            setIsOpen={setIsOpen}
                        />
                    </DialogContent>
                </Dialog>

            </div>
            <div>
                <Tabs defaultValue="account" className="w-[full] mx-6">
                    <TabsList>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <div>
                            <AdvancedTable
                                columns={locationColumns({ onDelete, onEdit })}
                                data={data?.results || []}
                                serverPagination={true}
                                totalCount={data?.count ?? 0}
                                isLoading={isLoading}
                                pageIndex={paginationState.pageIndex}
                                pageSize={paginationState.pageSize}
                                onPaginationChange={handleChange}

                            />

                        </div>
                    </TabsContent>
                    <TabsContent value="password">Change your password here.</TabsContent>
                </Tabs>
            </div>

        </div>
    )
}