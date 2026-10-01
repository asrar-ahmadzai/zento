"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { IconChevronDown } from "@tabler/icons-react"
import { debounce } from "lodash"
import { useState, useMemo, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/custom/data-table-pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

type AdvancedTableSearchConfig =
  | {
    placeholder: string
    column: string
    serverSide?: false
    value?: string
    onChange?: (value: string) => void
    submitLabel?: string
  }
  | {
    placeholder: string
    serverSide: true
    value?: string
    onChange: (value: string) => void
    column?: string
    submitLabel?: string
  }

interface AdvancedTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  search?: AdvancedTableSearchConfig
  onRowClick?: (row: T) => void
  totalCount?: number
  pageSize?: number
  pageIndex?: number
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
  serverPagination?: boolean
  serverSorting?: {
    value?: SortingState
    onChange: (sorting: SortingState) => void
  }
  isLoading?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  getRowId?: (originalRow: T, index: number) => string
  direction?: "ltr" | "rtl"
  labels?: {
    columns: string
    show: string
    noResults: string
    showing?: (values: { start: number; end: number; total: number }) => string
    selected?: (values: { selected: number; total: number }) => string
    previous?: string
    next?: string
  }
  useCompleteSearchPlaceholder?: boolean
}

export default function AdvancedTable<TData>({
  columns,
  data,
  search,
  onRowClick,
  totalCount = 0,
  pageSize = 10,
  pageIndex = 0,
  onPaginationChange,
  serverPagination = false,
  serverSorting,
  isLoading = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: onControlledRowSelectionChange,
  getRowId,
  direction = "ltr",
  labels,
  useCompleteSearchPlaceholder = false,
}: AdvancedTableProps<TData>) {
  const hasSearch = !!search
  const isServerSearch = search?.serverSide ?? false
  const searchValue = search?.value ?? ""
  const searchPlaceholder = search?.placeholder
  const searchColumn = !isServerSearch ? search?.column : undefined
  const onSearchChange = search?.onChange
  const submitSearch = Boolean(isServerSearch && search?.submitLabel)

  // Ensure data is always an array, even if undefined
  const safeData = useMemo(() => data || [], [data])
  const [sorting, setSorting] = useState<SortingState>(serverSorting?.value ?? [])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})
  const rowSelection = controlledRowSelection ?? internalRowSelection
  const setRowSelection = (
    updater: RowSelectionState | ((previous: RowSelectionState) => RowSelectionState),
  ) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater
    if (controlledRowSelection !== undefined) onControlledRowSelectionChange?.(next)
    else setInternalRowSelection(next)
  }
  const [localSearchValue, setLocalSearchValue] = useState(searchValue)
  // Initialize pagination state
  const [pagination, setPagination] = useState({
    pageIndex: pageIndex,
    pageSize: pageSize,
  })

  // Update local search value when prop changes
  useEffect(() => {
    setLocalSearchValue(searchValue)
  }, [searchValue])

  // Update local pagination state when props change
  useEffect(() => {
    setPagination({
      pageIndex: pageIndex,
      pageSize: pageSize,
    })
  }, [pageIndex, pageSize])

  useEffect(() => {
    if (serverSorting?.value) setSorting(serverSorting.value)
  }, [serverSorting?.value])

  const table = useReactTable({
    data: safeData,
    columns,
    onSortingChange: updater => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      setSorting(next)
      serverSorting?.onChange(next)
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    // Conditionally use pagination model based on serverPagination flag
    getPaginationRowModel: serverPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: isServerSearch ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId,

    // For server pagination, manually control the pagination state
    manualPagination: serverPagination,
    manualFiltering: isServerSearch,
    manualSorting: Boolean(serverSorting),
    pageCount: serverPagination ? Math.ceil(totalCount / pagination.pageSize) : undefined,

    onPaginationChange: updater => {
      if (typeof updater === "function") {
        const newPagination = updater(pagination)
        setPagination(newPagination)
        onPaginationChange?.(newPagination.pageIndex, newPagination.pageSize)
      } else {
        setPagination(updater)
        onPaginationChange?.(updater.pageIndex, updater.pageSize)
      }
    },

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  // Create debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        if (!hasSearch) {
          return
        }

        if (isServerSearch) {
          onSearchChange?.(value)
        } else {
          if (searchColumn) {
            table.getColumn(searchColumn)?.setFilterValue(value)
          }
          onSearchChange?.(value)
        }
      }, 500),
    [hasSearch, isServerSearch, onSearchChange, searchColumn, table],
  )
  const pageSizes = [5, 7, 10, 20, 50, 100]

  // Clean up debounce on unmount
  useEffect(() => {
    return () => debouncedSearch.cancel()
  }, [debouncedSearch])

  // Handle search input change
  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setLocalSearchValue(value)
    if (!submitSearch) debouncedSearch(value)
  }
  return (
    <div className="w-full">
      {/* SEARCH FIELD AND COLUMNS */}

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {search ? (
          <div className="flex max-w-md gap-2">
            <Input
              placeholder={
                useCompleteSearchPlaceholder
                  ? searchPlaceholder
                  : searchPlaceholder
                    ? `Search ${searchPlaceholder}...`
                    : "Search..."
              }
              value={localSearchValue}
              onChange={handleSearchInputChange}
              onKeyDown={(event) => {
                if (submitSearch && event.key === "Enter") {
                  event.preventDefault()
                  onSearchChange?.(localSearchValue)
                }
              }}
              className="max-w-md text-xs sm:text-sm"
            />
            {submitSearch ? (
              <Button type="button" onClick={() => onSearchChange?.(localSearchValue)}>
                {search.submitLabel}
              </Button>
            ) : null}
          </div>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-xs sm:text-sm">
                {labels?.columns ?? "Columns"} <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs sm:text-sm"
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                    >
                      {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={value => {
              table.setPagination({
                pageIndex: 0,
                pageSize: parseInt(value),
              })
            }}
          >
            <SelectTrigger className=" text-xs sm:text-sm">
              <SelectValue placeholder={labels?.show ?? "Show"} />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map(size => (
                <SelectItem key={size} value={size.toString()} className="text-xs sm:text-sm">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScrollArea
        className={`mx-auto w-[300px] min-w-full mt-4 rounded-md border whitespace-nowrap`}
      >
        <Table dir={direction}>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} className="text-start text-xs sm:text-sm">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 text-xs sm:text-sm"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <IconChevronDown
                            className={`size-4 transition-transform ${header.column.getIsSorted() === "asc" ? "rotate-180" : ""}`}
                          />
                        </Button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`loading-row-${index}`}>
                  {Array.from({
                    length: table.getVisibleLeafColumns().length,
                  }).map((__, cellIndex) => (
                    <TableCell key={`loading-cell-${index}-${cellIndex}`}>
                      <Skeleton className="h-4 w-full min-w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`text-xs sm:text-sm ${onRowClick && "cursor-pointer hover:bg-muted/50"}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className="text-start"
                      data-cell-type={cell.column.id === "actions" ? "action" : "default"}
                      onClick={e => {
                        // Get the clicked element and its ancestors
                        const target = e.target as HTMLElement
                        const selectCell = cell.column.id === "select"
                        const actionCell =
                          target.closest('[data-cell-type="action"]') ||
                          cell.column.id === "actions"
                        const dialog = target.closest('dialog, [role="dialog"]')

                        // Don't trigger row click if:
                        // 1. Clicking an action cell
                        // 2. Clicking within a dialog/modal
                        // 3. Clicking a button or interactive element
                        if (
                          actionCell ||
                          dialog ||
                          selectCell ||
                          target.closest("button") ||
                          target.closest("a") ||
                          target.closest("input") ||
                          target.closest("select")
                        ) {
                          return
                        }

                        onRowClick?.(row.original)
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {labels?.noResults ?? "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" className="h-2 mb-0.5 px-1" />
      </ScrollArea>

      {/* PAGINATION */}
      <div>
        <DataTablePagination
          table={table}
          totalCount={serverPagination ? totalCount : undefined}
          serverPagination={serverPagination}
          labels={labels}
        />
      </div>
    </div>
  )
}
