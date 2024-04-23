"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useRef, useState } from "react";
import { DataTable, ProductDetail } from "./_components/table/table";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [select, setSelect] = useState("tiki");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputRef.current?.value) return;

    const product = inputRef.current?.value;
    try {
      setLoading(true);
      setData([]);
      const response = await fetch(`/api/${select}/products?product=${product}`);
      const data = await response.json();
      const { productsDetail } = data;
      setData(productsDetail);
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const onSelectChange = (value: string) => {
    setSelect(value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-20 gap-5">
      <div className="flex w-full justify-between">
        <h1 className="text-4xl font-bold">Product Crawler 🕷️🎯</h1>
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 justify-between w-[35%]"
        >
          <div className="flex justify-between gap-2 flex-1 border-gray-300 border rounded-md">
            <Input
              ref={inputRef}
              type="text"
              placeholder="What's product you want to crawl?"
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Select onValueChange={(value) => onSelectChange(value)}>
              <SelectTrigger className="border-none justify-center gap-2 w-[25%] focus:ring-0 focus:ring-offset-0 px-0">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="tiki">Tiki</SelectItem>
                  <SelectItem value="sendo">Sendo</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={loading} type="submit">
            <Search />
          </Button>
        </form>
      </div>
      <DataTable
        data={data}
        loading={loading}
        product={inputRef.current?.value!}
        select={select}
      />
    </main>
  );
}
