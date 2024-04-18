import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DataTable } from "./_components/table/table";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-20 gap-5">
      <div className="flex w-full justify-between">
        <h1 className="text-4xl font-bold">Product Crawler 🕷️🎯</h1>
        <div className="flex w-1/3 justify-between gap-3">
          <Input type="text" placeholder="What's product you want to crawl?" />
          <Button>
            <Search />
          </Button>
        </div>
      </div>
      <DataTable />
    </main>
  );
}
