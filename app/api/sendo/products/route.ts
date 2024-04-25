import { writeCsv } from "@/utils/write-csv";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

const getProductNames = async (product: string) => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const productSlugs: any[] = [];

  try {
    const page = await browser.newPage();

    const url = `https://www.sendo.vn/tim-kiem?q=${product}`;

    await Promise.any([page.waitForNavigation(), page.goto(url)]);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    for (let i = 0; i < 8; i++) {
      await page.click("button.d7ed-YaJkXL:nth-child(1)");
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const productNames = await page.$$eval(
      ".d7ed-NcrsFA > ._0337-BT20Ke > .d7ed-mPGbtR > div",
      (resultItems) => {
        return resultItems.map((resultItem) => {
          const aTag = resultItem.querySelector("a")!;
          const urlSegment = aTag.href.split("/");
          const lastSegment = urlSegment[urlSegment.length - 1];
          return lastSegment.split(".")[0];
        });
      }
    );

    console.log(productNames.length);

    productSlugs.push(...productNames);
  } catch (error) {
    console.error(`Error during product Url extraction: ${error}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return productSlugs;
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
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    try {
      const response = await fetch(`https://detail-api.sendo.vn/full/${slug}`);
      const { data } = await response.json();
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
      const minifiedShortDesc = short_description.replace(/\r?\n/g, " ");

      const image_urls = media.map((image: any) => image["image"]).join(", ");
      const category = category_info.map((cat: any) => cat["title"]).join(", ");
      const qty = variants.reduce((acc: number, variant: any) => {
        return acc + variant["stock"];
      }, 0);

      productsDetail.push({
        SKU: sku_user,
        Name: name,
        Short_Description: minifiedShortDesc,
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
