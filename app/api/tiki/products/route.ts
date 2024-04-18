import { createObjectCsvWriter } from "csv-writer";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

const writeCsv = (filePath: string, header: string[], data: any[][]) => {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: header.map((columnName) => ({
      id: columnName,
      title: columnName,
    })),
  });

  const records = data.map((record) => {
    const recordObject: {
      [key: string]: any;
    } = {};
    header.forEach((columnName, index) => {
      recordObject[columnName] = record[index];
    });
    return recordObject;
  });

  csvWriter
    .writeRecords(records)
    .then(() => {
      console.log(`CSV file "${filePath}" written successfully.`);
    })
    .catch((error) => {
      console.error(`Error writing CSV file "${filePath}":`, error);
    });
};

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

      const response = await Promise.any([
        page.waitForNavigation(),
        page.goto(url),
      ]);

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

  const productsDetail: any[] = [];

  // for (let i = 0; i < results.length; i++) {
  //   const result = results[i];

  //   const [id, spid] = result;

  //   // delay to avoid being blocked by Tiki after 50 requests
  //   if (i % 50 === 0) {
  //     await new Promise((resolve) => setTimeout(resolve, 10000));
  //   }

  //   try {
  //     const response = await fetch(
  //       `https://tiki.vn/api/v2/products/${id}?platform=web&spid=${spid}&version=3`
  //     );
  //     const data = await response.json();
  //     const {
  //       sku,
  //       name,
  //       price,
  //       short_description,
  //       description,
  //       categories: { name: category },
  //       images,
  //       stock_item: { qty },
  //     } = data;

  //     const minifiedDesc = description.replace(/(\r\n|\n|\r)/gm, " ");

  //     const image_urls = images.map((image: any) => image.base_url).join(",");
  //     productsDetail.push([
  //       sku,
  //       name,
  //       short_description,
  //       minifiedDesc,
  //       price,
  //       category,
  //       image_urls,
  //       qty,
  //     ]);
  //   } catch (error) {
  //     console.error(`Error fetching product details for id ${id}:`, error);
  //   }
  // }

  // writeCsv(
  //   `data/tiki-${product}-products-detail.csv`,
  //   [
  //     "SKU",
  //     "Name",
  //     "Short_Description",
  //     "Description",
  //     "Price",
  //     "Category",
  //     "Image_URLs",
  //     "Quantity",
  //   ],
  //   productsDetail
  // );

  return NextResponse.json(
    { message: "Success!", length: results.length },
    {
      status: 200,
    }
  );
};
