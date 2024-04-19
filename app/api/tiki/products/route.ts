import { writeCsv } from "@/utils/write-csv";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export const getProductsId = async (product: string) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.SBR_WS_ENDPOINT,
  });

  const dataViewContent = [];
  let pageNumber = 1;

  try {
    while (dataViewContent.length <= 600) {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(2 * 60 * 1000);

      const url =
        pageNumber === 1
          ? `https://tiki.vn/search?q=${product}`
          : `https://tiki.vn/search?q=${product}&page=${pageNumber}`;

      await Promise.any([page.waitForNavigation(), page.goto(url)]);

      const productUrls = await page.$$eval(
        ".CatalogProducts__Wrapper-sc-1r8ct7c-0 > div",
        (resultItems) => {
          return resultItems.map((resultItem) => {
            const aTag = resultItem.querySelector("a")!;
            const data_view_content = JSON.parse(
              aTag.getAttribute("data-view-content")!
            )["click_data"];
            return [data_view_content["id"], data_view_content["spid"]];
          });
        }
      );

      dataViewContent.push(...productUrls);

      if (dataViewContent.length >= 200 && dataViewContent.length <= 600) {
        console.log(
          `Processed ${dataViewContent.length} products. Sleeping for 10 seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      pageNumber++;
    }
  } catch (error) {
    console.error(`Error during product ID extraction: ${error}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  writeCsv(
    `data/tiki-${product}-products-id.csv`,
    ["ID", "SPID"],
    dataViewContent
  );

  return dataViewContent;
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product");
  const decodedProduct = decodeURIComponent(product!);

  const results = await getProductsId(decodedProduct);
  // const results: any[] = [];
  // const filePath = "data/tiki-sách-products-id.csv";

  // // read csv file
  // try {
  //   await new Promise((resolve, reject) => {
  //     fs.createReadStream(filePath)
  //       .pipe(csvParser())
  //       .on("data", (data) => results.push(data))
  //       .on("end", () => {
  //         resolve(results);
  //       })
  //       .on("error", (error) => {
  //         reject(error);
  //       });
  //   });
  // } catch (error) {
  //   console.error("Error reading CSV file:", error);
  //   throw new Error("Failed to fetch product details");
  // }

  const productsDetail: any[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    const [id, spid] = result;
    // const id = result["ID"];
    // const spid = result["SPID"];

    // delay to avoid being blocked by Tiki after 50 requests
    if (i % 50 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    try {
      const response = await fetch(
        `https://tiki.vn/api/v2/products/${id}?spid=${spid}`
      );
      const data = await response.json();
      const {
        sku,
        name,
        price,
        short_description,
        description,
        categories: { name: category },
        images,
        stock_item: { qty },
      } = data;

      const minifiedDesc = description.replace(/(\r\n|\n|\r)/gm, " ");

      const image_urls = images.map((image: any) => image.base_url).join(",");
      productsDetail.push([
        sku,
        name,
        short_description,
        minifiedDesc,
        price,
        category,
        image_urls,
        qty,
      ]);
    } catch (error) {
      console.error(`Error fetching product details for id ${id}:`, error);
    }
  }

  writeCsv(
    `data/tiki-${product}-products-detail.csv`,
    [
      "SKU",
      "Name",
      "Short_Description",
      "Description",
      "Price",
      "Categories",
      "Images",
      "Quantity",
    ],
    productsDetail
  );

  return NextResponse.json(
    { message: "Success!", length: productsDetail.length },
    {
      status: 200,
    }
  );
};
