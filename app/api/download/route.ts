import * as fs from "fs";
import * as path from "path";
import { ReadableOptions } from "stream";

function streamFile(
  path: string,
  options?: ReadableOptions
): ReadableStream<Uint8Array> {
  const downloadStream = fs.createReadStream(path, {
    ...options,
    encoding: "utf-8",
  });

  return new ReadableStream({
    start(controller) {
      downloadStream.on("data", (chunk: string | Buffer) => {
        if (typeof chunk === "string") {
          chunk = Buffer.from(chunk, "utf-8");
        }
        controller.enqueue(chunk);
      });
      downloadStream.on("end", () => controller.close());
      downloadStream.on("error", (error: NodeJS.ErrnoException) =>
        controller.error(error)
      );
    },
    cancel() {
      downloadStream.destroy();
    },
  });
}

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product");
  const store = searchParams.get("store");
  const decodedProduct = decodeURIComponent(product!);

  const filePath = path.join(
    process.cwd(),
    `data/${store}-${decodedProduct}-products-detail.csv`
  );

  const stats: fs.Stats = await fs.promises.stat(filePath);
  const data: ReadableStream<Uint8Array> = streamFile(filePath);

  return new Response(data, {
    headers: {
      "Content-Type": "text/csv",
      charset: "utf-8",
      "Content-Length": stats.size.toString(),
      "Content-Disposition": `attachment; filename=products-detail.csv`,
    },
  });
};
