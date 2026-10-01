"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Location } from "@/typs/Location"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

import { Edit, MoreHorizontal, Trash2 } from "lucide-react"

type LocationColumnsProps = {
    onDelete: (id: string) => void
    onEdit?: (location: Location) => void
}

export const locationColumns = ({
    onDelete,
    onEdit,
}: LocationColumnsProps): ColumnDef<Location>[] => [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "province_name",
            header: "Province",
        },
        {
            accessorKey: "name",
            header: "City",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">{("openActions")}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    className=" hover:cursor-pointer"
                                    onClick={() => onEdit?.(row.original)}

                                >
                                    <Edit className="me-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive hover:cursor-pointer"
                                    onClick={() => onDelete(row.original.id)}

                                >

                                    <Trash2 className="me-2 h-4 w-4 " />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]