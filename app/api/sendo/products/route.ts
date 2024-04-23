import { writeCsv } from "@/utils/write-csv";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export const getProductNames = async (product: string) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.SBR_WS_ENDPOINT,
  });

  const productUrls: string[] = [];

  try {
    while (productUrls.length <= 100) {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(2 * 60 * 1000);

      const url = `https://www.sendo.vn/tim-kiem?q=${product}`;

      await Promise.any([page.waitForNavigation(), page.goto(url)]);

      const productUrls = await page.$$eval(
        ".d7ed-mPGbtR > div",
        (resultItems) => {
          return resultItems.map((resultItem) => {
            const url = resultItem.querySelector("a")!.href.split("/");
            const lastSegment = url[url.length - 1];
            return lastSegment.split(".")[0];
          });
        }
      );

      productUrls.push(...productUrls);

      if (productUrls.length >= 200 && productUrls.length <= 600) {
        console.log(
          `Processed ${productUrls.length} products. Sleeping for 10 seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  } catch (error) {
    console.error(`Error during product Url extraction: ${error}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return productUrls;
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product");
  const decodedProduct = decodeURIComponent(product!);

  const results = await getProductNames(decodedProduct);
  const productsDetail: any[] = [];

  for (let i = 0; i < results.length; i++) {
    const slug = results[i];

    if (i % 50 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    try {
      const response = await fetch(`https://detail-api.sendo.vn/full/${slug}`);
      const data = await response.json();
      const {
        sku_user,
        name,
        price,
        short_description,
        description_info: { description },
        category_info,
        media,
        variants,
      } = data;

      const minifiedDesc = description.replace(/(\r\n|\n|\r)/gm, " ");

      const image_urls = media.map((image: any) => image["image"]).join(",");
      const category = category_info.join(",");
      const qty = variants.reduce((acc: number, variant: any) => {
        return acc + variant.stock;
      }, 0);

      productsDetail.push({
        SKU: sku_user,
        Name: name,
        Short_Description: short_description,
        Description: minifiedDesc,
        Price: price,
        Category: category,
        Images: image_urls,
        Quantity: qty,
      });
    } catch (error) {
      console.error(`Error fetching product details for ${slug}:`, error);
    }
  }

  writeCsv(
    `data/sendo-${product?.trim()}-products-detail.csv`,
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
    { message: "Success!", productsDetail },
    {
      status: 200,
    }
  );
};
