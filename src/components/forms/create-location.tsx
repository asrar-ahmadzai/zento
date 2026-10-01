"use client";

import { Controller, useForm } from "react-hook-form";
import {
    Field,
    FieldError,
    FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createLocation,
    UpdateLocation,
} from "@/actions/location";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { Spinner } from "../ui/spinner";
import { useEffect } from "react";
import { toast } from "sonner";
import { getprovinces } from "@/actions/province";
import { AsyncDropdown } from "../custom/async-dropdown";

const locationSchema = z.object({
    name: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
});

export type LocationForm =
    z.infer<typeof locationSchema>;

type CreateLocationProps = {
    id: string;
    name: string;

    // Province ID
    province?: string;

    setIsOpen: React.Dispatch<
        React.SetStateAction<boolean>
    >;
};

export default function CreateLocation({
    id,
    name = "",
    province = "",
    setIsOpen,
}: CreateLocationProps) {

    // Make sure province ID is always a string
    const provinceId = province?.toString() ?? "";

    const form = useForm<LocationForm>({
        resolver: zodResolver(locationSchema),

        defaultValues: {
            name: name ?? "",
            province: provinceId,
        },
    });

    useEffect(() => {
        form.reset({
            name: name ?? "",
            province: province?.toString() ?? "",
        });
    }, [id, name, province, form]);

    const queryClient = useQueryClient();

    const createmutation = useMutation({
        mutationFn: createLocation,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["locations"],
            });

            toast.success(
                "your data is created"
            );

            setIsOpen(false);
        },

        onError: () => {
            toast.error(
                "submit is failed"
            );
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: LocationForm;
        }) => UpdateLocation(id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["locations"],
            });

            toast.success(
                "your data is updated"
            );

            setIsOpen(false);
        },

        onError: () => {
            toast.error(
                "update is failed"
            );
        },
    });

    function submitdata(data: LocationForm) {
        console.log("SUBMIT DATA:", data);

        if (id) {
            updateMutation.mutate({
                id,
                data,
            });
        } else {
            createmutation.mutate(data);
        }
    }

    const isPending =
        createmutation.isPending ||
        updateMutation.isPending;

    if (isPending) {
        return <Spinner />;
    }

    return (
        <div>
            <form
                onSubmit={form.handleSubmit(
                    submitdata
                )}
            >
                {/* CITY */}
                <Controller
                    name="name"
                    control={form.control}
                    render={({
                        field,
                        fieldState,
                    }) => (
                        <Field>
                            <FieldLabel
                                htmlFor={field.name}
                            >
                                City
                            </FieldLabel>

                            <Input
                                {...field}
                                id={field.name}
                            />

                            {fieldState.invalid && (
                                <FieldError
                                    errors={[
                                        fieldState.error,
                                    ]}
                                />
                            )}
                        </Field>
                    )}
                />

                {/* PROVINCE */}
                <Controller
                    name="province"
                    control={form.control}
                    render={({
                        field,
                        fieldState,
                    }) => (
                        <Field>
                            <FieldLabel>
                                Select Province
                            </FieldLabel>

                            <AsyncDropdown

                                value={field.value}
                                onSelect={
                                    field.onChange
                                }
                                fetchFn={async () => {
                                    const results =
                                        await getprovinces();
                                    return { results };
                                }}
                                getOptionLabel={(province) => province.name}
                                getOptionValue={(province) => province.id.toString()}
                                queryKey={[
                                    "asyncdropdown",
                                    "provinces",
                                ]}
                                placeholder="Select province"
                            />

                            {fieldState.invalid && (
                                <FieldError
                                    errors={[
                                        fieldState.error,
                                    ]}
                                />
                            )}
                        </Field>
                    )}
                />

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        className="mt-4"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        </div>
    );
}