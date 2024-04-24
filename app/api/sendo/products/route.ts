import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export const GET = async (request: Request) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.SBR_WS_ENDPOINT,
  });

  const productSlugs: any[] = [];

  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product");
  const decodedProduct = decodeURIComponent(product!);

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);

    const url = `https://www.sendo.vn/tim-kiem?q=${decodedProduct}`;

    await Promise.any([page.waitForNavigation(), page.goto(url)]);

    const productNames = await page.$$eval(
      ".d7ed-NcrsFA > ._0337-BT20Ke > .d7ed-mPGbtR > div:nth-child(1)",
      (resultItems) => {
        return resultItems.map((resultItem) => {
          const aTag = resultItem.querySelector("a");
          return aTag;
          // const urlSegment = aTag.href.split("/");
          // const lastSegment = urlSegment[urlSegment.length - 1];
          // return lastSegment.split(".")[0];
        });
      }
    );

    console.log(productNames);

    // productSlugs.push(...productNames);
  } catch (error) {
    console.error(`Error during product Url extraction: ${error}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return NextResponse.json(
    { message: "Success!", productSlugs },
    {
      status: 200,
    }
  );
};

// export const GET = async (request: Request) => {
//   const { searchParams } = new URL(request.url);
//   const product = searchParams.get("product");
//   const decodedProduct = decodeURIComponent(product!);

//   const results = await getProductNames(decodedProduct);
//   const productsDetail: any[] = [];

//   for (let i = 0; i < results.length; i++) {
//     const slug = results[i];

//     if (i % 50 === 0) {
//       await new Promise((resolve) => setTimeout(resolve, 10000));
//     }

//     try {
//       const response = await fetch(`https://detail-api.sendo.vn/full/${slug}`);
//       const data = await response.json();
//       const {
//         sku_user,
//         name,
//         price,
//         short_description,
//         description_info: { description },
//         category_info,
//         media,
//         variants,
//       } = data;

//       const minifiedDesc = description.replace(/(\r\n|\n|\r)/gm, " ");

//       const image_urls = media.map((image: any) => image["image"]).join(",");
//       const category = category_info.join(",");
//       const qty = variants.reduce((acc: number, variant: any) => {
//         return acc + variant.stock;
//       }, 0);

//       productsDetail.push({
//         SKU: sku_user,
//         Name: name,
//         Short_Description: short_description,
//         Description: minifiedDesc,
//         Price: price,
//         Category: category,
//         Images: image_urls,
//         Quantity: qty,
//       });
//     } catch (error) {
//       console.error(`Error fetching product details for ${slug}:`, error);
//     }
//   }

//   writeCsv(
//     `data/sendo-${product?.trim()}-products-detail.csv`,
//     [
//       "SKU",
//       "Name",
//       "Short_Description",
//       "Description",
//       "Price",
//       "Categories",
//       "Images",
//       "Quantity",
//     ],
//     productsDetail
//   );

//   return NextResponse.json(
//     { message: "Success!", productsDetail },
//     {
//       status: 200,
//     }
//   );
// };
