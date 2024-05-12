import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { data } from "./data";
import { writeCsv } from "@/utils/write-csv";

const getUrls = async () => {
  const browser = await puppeteer.launch();

  const productSlugs: string[] = [];
  let pageNum = 1;
  const page = await browser.newPage();

  try {
    while (pageNum <= 29) {
      const url =
        pageNum === 1
          ? `https://shopvnb.com/giay-cau-long.html`
          : `https://shopvnb.com/giay-cau-long.html?page=${pageNum}`;

      await Promise.any([page.waitForNavigation(), page.goto(url)]);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const productUrls: string[] = await page.evaluate(() => {
        const productItems = document.querySelectorAll(
          "div.products-view.products-view-grid.list_hover_pro .row div div div.product-thumbnail > a.product_overlay"
        );

        return Array.from(productItems).map((productItem) => {
          return productItem.getAttribute("href")!;
        });
      });

      productSlugs.push(...productUrls);
      pageNum++;
    }
  } catch (error) {
    console.error(`Error during product Url extraction: ${error}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return productSlugs;
};

// export const GET = async () => {
//   // return NextResponse.json(data.length);

//   const browser = await puppeteer.launch();
//   const urls = slugs;

//   const productsDetail: any[] = [];

//   const page = await browser.newPage();

//   await page.setViewport({
//     width: 1920,
//     height: 1080,
//   });
//   await new Promise((resolve) => setTimeout(resolve, 4000));

//   try {
//     for (let i = 500; i < 580; i++) {
//       const url = urls[i];

//       await Promise.any([
//         page.waitForNavigation(),
//         page.goto(`https://shopvnb.com/${url}`),
//       ]);

//       await new Promise((resolve) => setTimeout(resolve, 4000));

//       try {
//         const data = await page.evaluate(() => {
//           const title = document.querySelector("h1.title-product")!.textContent;
//           const sku = document.querySelector("span.a-sku")!.textContent;
//           const brand = document.querySelector("a.a-vendor")!.textContent;
//           const price = document.querySelector(
//             "span.price.product-price"
//           )!.textContent;
//           const old_price = document.querySelector(
//             "del.price.product-price-old"
//           )!.textContent;
//           const description = document.querySelector(
//             "#content > div > div > div"
//           )!.innerHTML;
//           const spec = document.querySelector("#tab_thong_so > div > table")!;
//           const rows = spec.querySelectorAll("tr");
//           const specs = [];
//           for (const row of rows) {
//             const [key, value] = row.querySelectorAll("td");
//             specs.push({
//               key: key.textContent,
//               value: value.textContent,
//             });
//           }
//           const imgUrls = document.querySelectorAll(
//             ".gallery-top .swiper-wrapper .swiper-slide img"
//           );
//           const images = Array.from(imgUrls).map((imgUrl) => {
//             return imgUrl.getAttribute("src")!;
//           });

//           return {
//             title,
//             sku,
//             brand,
//             images,
//             price,
//             old_price,
//             description,
//             specs,
//           };
//         });
//         productsDetail.push(data);
//       } catch (error) {
//         console.error("An error occurred while evaluating the page:", error);
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }

//   return NextResponse.json(productsDetail);
// };

// export const GET = () => {
//   return NextResponse.json(data.length);
// };

export const GET = () => {
  const productsDetail = data;

  const maxAttributes = Math.max(
    ...data.map((product) => product.specs.length)
  );

  const csvHeaders = [
    "Name",
    "Description",
    "Categories",
    "SKU",
    "Images",
    "Regular Price",
    "Sale Price",
  ];

  for (let i = 1; i <= maxAttributes; i++) {
    csvHeaders.push(`Attribute ${i} name`);
    csvHeaders.push(`Attribute ${i} value(s)`);
    csvHeaders.push(`Attribute ${i} visible`);
    csvHeaders.push(`Attribute ${i} global`);
  }

  const flattenedProducts = data.flatMap((product) => {
    const attributes = product.specs.slice(0, maxAttributes);
    const attributesData = [];

    for (let i = 0; i < product.specs.length; i++) {
      const attribute = attributes[i];
      attributesData.push({
        [`Attribute ${i + 1} name`]: attribute
          ? attribute.key.replace(":", "")
          : "",
        [`Attribute ${i + 1} value(s)`]: attribute ? attribute.value : "",
        [`Attribute ${i + 1} visible`]: attribute ? 1 : "",
        [`Attribute ${i + 1} global`]: attribute ? 1 : "",
      });
    }

    const sample = {
      Name: product.title,
      Description: product.description
        .replace("ShopVNB", "<a href='/'>BetterBadminton</a>")
        .replace("ShopVNB.", "BetterBadminton")
        .replace("Shop VNB", "BetterBadminton")
        .replace("VNB", "BetterBadminton")
        .replace(/style="font-family:arial,helvetica,sans-serif"/g, "")
        .replace(
          "https://shopvnb.com/giay-cau-long.html",
          "https://g5-badminton.uit.io.vn/product-category/giay-cau-long"
        )
        .replace(/\.html/g, "")
        .replace(
          /https:\/\/shopvnb\.com\//g,
          "https://g5-badminton.uit.io.vn/product-category/giay-cau-long/"
        ),
      SKU: product.sku.replace("VNB", "BB"),
      Images: product.images.join(", "),
      Categories:
        "Giày cầu lông " + product.brand.replace(/\n/g, "").replace(/\t/g, ""),
      "Sale Price": product.price.replace("₫", "").replace(/\./g, "").trim(),
      "Regular Price": product.old_price
        .replace("₫", "")
        .replace(/\./g, "")
        .trim(),
      ...Object.assign({}, ...attributesData),
    };

    return sample;
  });

  writeCsv("data/vnb/badminton-shoes.csv", csvHeaders, flattenedProducts);

  return NextResponse.json(flattenedProducts);
};
