import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { data } from "./data";

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

export const GET = async () => {
  // const browser = await puppeteer.launch();
  // const urls = await getUrls();

  // const productsDetail: any[] = [];

  // // console.log(urls);

  // const page = await browser.newPage();
  // try {
  //   for (let i = 0; i < urls.length; i++) {
  //     const url = urls[i];

  //     await page.setViewport({
  //       width: 1920,
  //       height: 1080,
  //     });

  //     await new Promise((resolve) => setTimeout(resolve, 2000));

  //     await Promise.any([
  //       page.waitForNavigation(),
  //       page.goto(`https://shopvnb.com/${url}`),
  //     ]);

  //     await new Promise((resolve) => setTimeout(resolve, 2000));

  //     try {
  //       const data = await page.evaluate(() => {
  //         const title = document.querySelector("h1.title-product")!.textContent;
  //         const sku = document.querySelector("span.a-sku")!.textContent;
  //         const brand = document.querySelector("a.a-vendor")!.textContent;
  //         const price = document.querySelector(
  //           "span.price.product-price"
  //         )!.textContent;
  //         const old_price = document.querySelector(
  //           "del.price.product-price-old"
  //         )!.textContent;
  //         const description = document.querySelector(
  //           "#content > div > div > div"
  //         )!.innerHTML;
  //         const spec = document.querySelector("#tab_thong_so > div > table")!;
  //         const rows = spec.querySelectorAll("tr");
  //         const specs = [];
  //         for (const row of rows) {
  //           const [key, value] = row.querySelectorAll("td");
  //           specs.push({
  //             key: key.textContent,
  //             value: value.textContent,
  //           });
  //         }
  //         const imgUrls = document.querySelectorAll(
  //           ".gallery-top .swiper-wrapper .swiper-slide img"
  //         );
  //         const images = Array.from(imgUrls).map((imgUrl) => {
  //           return imgUrl.getAttribute("src")!;
  //         });

  //         return {
  //           title,
  //           sku,
  //           brand,
  //           images,
  //           price,
  //           old_price,
  //           description,
  //           specs,
  //         };
  //       });
  //       productsDetail.push(data);
  //     } catch (error) {
  //       console.error("An error occurred while evaluating the page:", error);
  //     }
  //   }
  // } catch (error) {
  //   console.log(error);
  // } finally {
  //   if (browser) {
  //     await browser.close();
  //   }
  // }

  const test = data;

  return NextResponse.json(test.length);
};
