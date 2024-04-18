"use client";

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./column";

export type ProductDetail = {
  sku: string;
  name: string;
  short_description: string;
  description: string;
  price: number;
  category: string;
  image_urls: string;
  qty: number;
};

const data: ProductDetail[] = [
  // sample data
  {
    sku: "SKU123",
    name: "Product 1",
    short_description: "Short description",
    description: "Description",
    price: 100,
    category: "Category 1",
    image_urls: "https://example.com/image1.jpg",
    qty: 10,
  },
  {
    sku: "SKU456",
    name: "Product 2",
    short_description: "Short description",
    description: "Description",
    price: 200,
    category: "Category 2",
    image_urls: "https://example.com/image2.jpg",
    qty: 20,
  },
  {
    sku: "SKU789",
    name: "Product 3",
    short_description: "Short description",
    description: "Description",
    price: 300,
    category: "Category 3",
    image_urls: "https://example.com/image3.jpg",
    qty: 30,
  },
  {
    sku: "SKU123",
    name: "Product 1",
    short_description: "Short description",
    description: "Description",
    price: 100,
    category: "Category 1",
    image_urls: "https://example.com/image1.jpg",
    qty: 10,
  },
  {
    sku: "SKU456",
    name: "Product 2",
    short_description: "Short description",
    description: "Description",
    price: 200,
    category: "Category 2",
    image_urls: "https://example.com/image2.jpg",
    qty: 20,
  },
  {
    sku: "SKU789",
    name: "Product 3",
    short_description: "Short description",
    description: "Description",
    price: 300,
    category: "Category 3",
    image_urls: "https://example.com/image3.jpg",
    qty: 30,
  },
  {
    sku: "SKU123",
    name: "Product 1",
    short_description: "Short description",
    description: "Description",
    price: 100,
    category: "Category 1",
    image_urls: "https://example.com/image1.jpg",
    qty: 10,
  },
  {
    sku: "SKU123",
    name: "Product 1",
    short_description: "Short description",
    description: "Description",
    price: 100,
    category: "Category 1",
    image_urls: "https://example.com/image1.jpg",
    qty: 10,
  },
  {
    sku: "SKU123",
    name: "Product 1",
    short_description: "Short description",
    description: "Description",
    price: 100,
    category: "Category 1",
    image_urls: "https://example.com/image1.jpg",
    qty: 10,
  },
  {
    sku: "SKU123",
    name: "Product 1",
    short_description: "Short description",
    description: "Description",
    price: 100,
    category: "Category 1",
    image_urls: "https://example.com/image1.jpg",
    qty: 10,
  },
  {
    sku: "SKU123",
    name: "Product 1",
    short_description: "Short description",
    description: "Description",
    price: 100,
    category: "Category 1",
    image_urls: "https://example.com/image1.jpg",
    qty: 10,
  },
];

export function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
