import { writeCsv } from "@/utils/write-csv";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { test_data } from "./test-data";

const getUrls = async () => {
  const browser = await puppeteer.launch();

  const productSlugs: string[] = [];
  let pageNum = 1;
  const page = await browser.newPage();

  try {
    while (pageNum <= 40) {
      const url =
        pageNum === 1
          ? `https://shopvnb.com/vot-cau-long.html`
          : `https://shopvnb.com/vot-cau-long.html?page=${pageNum}`;

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
//   const browser = await puppeteer.launch();
//   const urls = slugs;

//   const productsDetail: any[] = [];

//   const page = await browser.newPage();
//   await page.setViewport({
//     width: 1920,
//     height: 1080,
//   });

//   try {
//     for (let i = 760; i < 800; i++) {
//       const url = urls[i];

//       await Promise.any([
//         page.waitForNavigation(),
//         page.goto(`https://shopvnb.com/${url}`),
//       ]);

//       if (i % 20 === 0) {
//         await new Promise((resolve) => setTimeout(resolve, 10000));
//       }

//       await new Promise((resolve) => setTimeout(resolve, 2000));

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
//         console.error(
//           `An error occurred while evaluating the page for ${url}`,
//           error
//         );
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

export const GET = () => {
  const data = test_data;

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
          "https://shopvnb.com/vot-cau-long.html",
          "https://g5-badminton.uit.io.vn/product-category/vot-cau-long/"
        )
        .replace(/\.html/g, "")
        .replace(
          /https:\/\/shopvnb\.com\//g,
          "https://g5-badminton.uit.io.vn/product-category/vot-cau-long/"
        ),
      SKU: product.sku.replace("VNB", "BB"),
      Images: product.images.join(", "),
      Categories:
        "Vợt cầu lông " + product.brand.replace(/\n/g, "").replace(/\t/g, ""),
      "Sale Price": product.price.replace("₫", "").replace(/\./g, "").trim(),
      "Regular Price": product.old_price
        .replace("₫", "")
        .replace(/\./g, "")
        .trim(),
      ...Object.assign({}, ...attributesData),
    };

    return sample;
  });

  writeCsv("data/vnb/badminton-rackets.csv", csvHeaders, flattenedProducts);

  return NextResponse.json(flattenedProducts);
};
