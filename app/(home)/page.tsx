"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRef, useState } from "react";
import { DataTable, ProductDetail } from "./_components/table/table";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputRef.current?.value) return;

    const product = inputRef.current?.value;
    try {
      setLoading(true);
      setData([]);
      const response = await fetch(`/api/tiki/products?product=${product}`);
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

  return (
    <main className="flex min-h-screen flex-col items-center p-20 gap-5">
      <div className="flex w-full justify-between">
        <h1 className="text-4xl font-bold">Product Crawler 🕷️🎯</h1>
        <form
          onSubmit={handleSubmit}
          className="flex w-1/3 justify-between gap-3"
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="What's product you want to crawl?"
          />
          <Button disabled={loading} type="submit">
            <Search />
          </Button>
        </form>
      </div>
      <DataTable data={data} loading={loading} />
    </main>
  );
}
