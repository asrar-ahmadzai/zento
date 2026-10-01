"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
    useInfiniteQuery,
    useQueryClient,
    InfiniteData,
} from "@tanstack/react-query";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { debounce } from "lodash";
import { DEFAULT_PER_PAGE } from "@/config/apiConfig";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface EmptyComponentProps {
    searchQuery: string;
    onClose: () => void;
}

interface AsyncDropdownProps<T> {
    onSelect: (value: string, option?: T) => void;
    fetchFn: (
        offset: number,
        limit: number,
        search?: string,
    ) => Promise<{ results: T[] }>;
    getOptionLabel: (option: T) => string;
    getOptionValue: (option: T) => string;
    placeholder?: string;
    value?: string;
    isOptionDisabled?: (option: T) => boolean;
    className?: string;
    queryKey: string[];
    emptyMessage?: string;
    clearLabel?: string;
    EmptyComponent?:
    React.ReactNode | ((props: EmptyComponentProps) => React.ReactNode);
    cacheTime?: number;
    initialLabel?: string;
    initialData?: { results: T[] };
    disabled?: boolean;
}

export function AsyncDropdown<T>({
    onSelect,
    fetchFn,
    getOptionLabel,
    getOptionValue,
    placeholder = "Select an option",
    value,
    isOptionDisabled,
    className = "",
    queryKey,
    emptyMessage = "No options available",
    clearLabel,
    EmptyComponent,
    cacheTime,
    initialLabel,
    initialData,
    disabled = false,
}: AsyncDropdownProps<T>) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const scrollTriggerRef = useRef<HTMLDivElement>(null);
    const [placement, setPlacement] = useState<"bottom" | "top">("bottom");

    const [selectedLabel, setSelectedLabel] = useState<string | undefined>(
        initialLabel,
    );
    const loadedValueRef = useRef<string | null>(null);

    const debouncedSetSearch = useMemo(
        () =>
            debounce((query: string) => {
                setDebouncedQuery(query);
            }, 500),
        [],
    );

    useEffect(() => {
        return () => debouncedSetSearch.cancel();
    }, [debouncedSetSearch]);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteQuery({
            queryKey: [...queryKey, debouncedQuery],
            initialPageParam: 0,
            queryFn: async ({ pageParam }) => {
                return await fetchFn(pageParam, DEFAULT_PER_PAGE, debouncedQuery);
            },
            getNextPageParam: (lastPage, pages) => {
                const resultsLength = lastPage?.results?.length || 0;
                return resultsLength === DEFAULT_PER_PAGE
                    ? pages.length * DEFAULT_PER_PAGE
                    : undefined;
            },
            initialData: initialData
                ? {
                    pages: [initialData],
                    pageParams: [],
                }
                : undefined,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            enabled: !disabled,
            gcTime: cacheTime != null ? cacheTime : 1000 * 60 * 5,
            staleTime: cacheTime != null ? cacheTime : 1000 * 60 * 5,
        });

    const allOptions = useMemo(
        () => data?.pages.flatMap((page) => page?.results ?? []) ?? [],
        [data],
    );

    useEffect(() => {
        if (
            value &&
            !allOptions.some((opt) => getOptionValue(opt) === value) &&
            loadedValueRef.current !== value &&
            !isLoading
        ) {
            loadedValueRef.current = value;

            const loadSelectedItem = async () => {
                try {
                    const result = await fetchFn(0, 1, value);
                    const exactMatch = result.results.find(
                        (item) => getOptionValue(item) === value,
                    );

                    if (exactMatch) {
                        setSelectedLabel(getOptionLabel(exactMatch));
                    }
                } catch (error) {
                    console.error("Error loading selected item:", error);
                }
            };

            loadSelectedItem();
        }
    }, [value, allOptions, fetchFn, getOptionLabel, getOptionValue, isLoading]);

    useIntersectionObserver({
        target: scrollTriggerRef as React.RefObject<HTMLElement>,
        onIntersect: () => {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        enabled: hasNextPage && !isFetchingNextPage && isOpen,
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = useCallback(
        (query: string) => {
            if (query === "") {
                queryClient.setQueryData(
                    [...queryKey, ""],
                    (data: InfiniteData<{ results: T[] }> | undefined) => ({
                        pages: data?.pages.slice(0, 1) ?? [],
                        pageParams: data?.pageParams.slice(0, 1) ?? [],
                    }),
                );
            }

            setSearchQuery(query);
            debouncedSetSearch(query);
            queryClient.cancelQueries({
                queryKey: [...queryKey, debouncedQuery],
            });
        },
        [debouncedSetSearch, queryClient, debouncedQuery, queryKey],
    );

    const selectedOption = value
        ? allOptions.find((opt) => getOptionValue(opt) === value)
        : undefined;

    const displayText = selectedOption
        ? getOptionLabel(selectedOption)
        : value && selectedLabel
            ? selectedLabel
            : placeholder;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => {
                    if (disabled) return;

                    if (!isOpen) {
                        const rect = dropdownRef.current?.getBoundingClientRect();
                        if (rect) {
                            const dropdownHeight = 350;
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const spaceAbove = rect.top;
                            setPlacement(
                                spaceBelow < dropdownHeight && spaceAbove > spaceBelow
                                    ? "top"
                                    : "bottom",
                            );
                        }
                    }

                    setIsOpen((prev) => !prev);
                }}
                className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md border bg-background text-sm cursor-pointer hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                    disabled && "cursor-not-allowed opacity-50",
                    className,
                )}
                aria-disabled={disabled}
            >
                <span className="truncate">{displayText}</span>
                <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </div>

            {isOpen && !disabled && (
                <div
                    className={cn(
                        "absolute z-50 w-full bg-background border rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 animate-in fade-in-0 zoom-in-95",
                        placement === "bottom" ? "top-full mt-1" : "bottom-full mb-1",
                    )}
                >
                    <div className="sticky top-0 p-2 border-b bg-background/80 backdrop-blur-sm">
                        <div className="relative">
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search..."
                                onClick={(e) => e.stopPropagation()}
                                className="pl-9"
                            />
                            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-contain">
                        {isLoading ? (
                            <div className="p-2 space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-2 w-full">
                                        <div className="flex flex-col flex-1 gap-1">
                                            <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                                            <div className="h-3 w-16 animate-pulse bg-muted rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : allOptions.length > 0 || clearLabel ? (
                            <>
                                {clearLabel && (
                                    <div
                                        onClick={() => {
                                            onSelect("");
                                            setSelectedLabel(undefined);
                                            setIsOpen(false);
                                        }}
                                        className="cursor-pointer px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 active:bg-accent"
                                    >
                                        {clearLabel}
                                    </div>
                                )}
                                {allOptions.map((option) => (
                                    <div
                                        key={getOptionValue(option)}
                                        onClick={() => {
                                            if (!isOptionDisabled?.(option)) {
                                                onSelect(getOptionValue(option), option);
                                                setSelectedLabel(getOptionLabel(option));
                                                setIsOpen(false);
                                            }
                                        }}
                                        className={`px-4 py-2.5 cursor-pointer text-sm transition-colors
                              hover:bg-accent/50 active:bg-accent
                              ${value === getOptionValue(option)
                                                ? "bg-accent text-accent-foreground"
                                                : ""
                                            }
                              ${isOptionDisabled?.(option)
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                    >
                                        {getOptionLabel(option)}
                                    </div>
                                ))}
                                {isFetchingNextPage && (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollTriggerRef} className="h-1" />
                            </>
                        ) : (
                            <div className="py-3">
                                {typeof EmptyComponent === "function" ? (
                                    EmptyComponent({
                                        searchQuery,
                                        onClose: () => setIsOpen(false),
                                    })
                                ) : React.isValidElement(EmptyComponent) ? (
                                    React.cloneElement(
                                        EmptyComponent as React.ReactElement<EmptyComponentProps>,
                                        {
                                            searchQuery,
                                            onClose: () => setIsOpen(false),
                                        },
                                    )
                                ) : (
                                    <div className="text-sm text-center text-muted-foreground">
                                        <p className="mt-2">{emptyMessage}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
