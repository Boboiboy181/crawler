import { writeCsv } from "@/utils/write-csv";
import { translate } from "@vitalets/google-translate-api";
import { NextResponse } from "next/server";
import { data } from "./proccessed-rackets";
import { rawProducts } from "./rackets";

const products = rawProducts.map((item) => {
  return {
    slug: item.handle,
    title: item.title,
    description: item.description,
    vendor: item.vendor,
    type: item.type,
    sku: item.variants[0].sku,
    images: item.images,
    price: parseFloat((item.price / 100).toFixed(2)) * 23000,
  };
});

// export const GET = async () => {
//   const browser = await puppeteer.launch();

//   const productsDetail = [];
//   const page = await browser.newPage();

//   try {
//     for (let i = 0; i < products.length; i++) {
//       const product = products[i];

//       await page.setViewport({
//         width: 1920,
//         height: 1080,
//       });

//       await new Promise((resolve) => setTimeout(resolve, 2000));

//       await Promise.any([
//         page.waitForNavigation(),
//         page.goto(`https://badmintonhq.co.uk/products/${product.slug}`),
//       ]);

//       await new Promise((resolve) => setTimeout(resolve, 5000));

//       const data = await page.evaluate(() => {
//         const specTable = document.querySelector(".spec-table")!;

//         const rows = specTable.querySelectorAll("tr");
//         const specs = [];
//         for (const row of rows) {
//           const [key, value] = row.querySelectorAll("td");
//           specs.push({
//             key: key.textContent,
//             value: value.textContent,
//           });
//         }

//         return specs;
//       });

//       productsDetail.push({
//         ...product,
//         specs: data,
//       });

//       // log when each product is done
//       console.log(`Done: ${product.slug} - ${i + 1}`);
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

async function translateData(data: any) {
  const translated: {
    [key: string]: any;
  } = {};
  for (const key in data) {
    if (typeof data[key] === "object" && data[key] !== null) {
      translated[key] = await translateData(data[key]); // Recursively translate nested objects
    } else {
      translated[key] = await translate(data[key], { to: "vi" }); // Translate text to Vietnamese
    }
  }
  return translated;
}

export const GET = async () => {
  const maxAttributes = Math.max(
    ...data.map((product) => product.specs.length)
  );

  const csvHeaders = [
    "Slug",
    "Title",
    "Description",
    "Vendor",
    "Category",
    "SKU",
    "Images",
    "Price",
  ];

  for (let i = 1; i <= maxAttributes; i++) {
    csvHeaders.push(`Attribute ${i} name`);
    csvHeaders.push(`Attribute ${i} value(s)`);
    csvHeaders.push(`Attribute ${i} visible`);
  }

  const flattenedProducts = data.flatMap((product) => {
    const attributes = product.specs.slice(0, maxAttributes); 
    const attributesData = [];

    for (let i = 0; i < maxAttributes; i++) {
      const attribute = attributes[i];
      attributesData.push({
        [`Attribute ${i + 1} name`]: attribute ? attribute.key : "",
        [`Attribute ${i + 1} value(s)`]: attribute ? attribute.value : "",
        [`Attribute ${i + 1} visible`]: attribute ? 1 : "",
      });
    }

    const sample = {
      Slug: product.slug,
      Title: product.title,
      Description: product.description,
      Vendor: product.vendor,
      Category: product.type,
      SKU: product.sku,
      Images: product.images.map((url) => "https:" + url).join(", "),
      Price: product.price,
      ...Object.assign({}, ...attributesData),
    };

    const translated = translateData(sample)
      .then((translatedData) => {
        console.log(translatedData);
      })
      .catch((error) => {
        console.error("Translation error:", error);
      });

    return translated;
  });

  writeCsv("data/badminton-rackets_vi.csv", csvHeaders, flattenedProducts);

  return NextResponse.json(flattenedProducts);
};
