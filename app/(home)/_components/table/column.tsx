"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProductDetail } from "./table";

export const columns: ColumnDef<ProductDetail>[] = [
  {
    accessorKey: "SKU",
    header: "SKU",
  },
  {
    accessorKey: "Name",
    header: "Name",
  },
  {
    accessorKey: "Category",
    header: "Category",
  },
  {
    accessorKey: "Quantity",
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => {
      const amount = parseInt(row.getValue("Quantity"));

      return <div className="text-center font-medium">{amount}</div>;
    },
  },
  {
    accessorKey: "Price",
    header: () => <div className="text-center">Price</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("Price"));

      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);

      return <div className="text-center font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "Short_Description",
    header: "Short Description",
    cell: ({ row }) => {
      const shortDesc: string = row.getValue("Short_Description");

      return <div className="max-w-[100px] truncate">{shortDesc}</div>;
    },
  },
  {
    accessorKey: "Description",
    header: "Description",
    cell: ({ row }) => {
      const desc: string = row.getValue("Description");

      return <div className="max-w-[100px] truncate">{desc}</div>;
    },
  },
  {
    accessorKey: "Images",
    header: "Images",
    cell: ({ row }) => {
      const images: string = row.getValue("Images");

      return <div className="max-w-[100px] truncate">{images}</div>;
    },
  },
];
