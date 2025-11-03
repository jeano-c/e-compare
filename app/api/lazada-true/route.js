import { NextResponse } from "next/server";
import axios from "axios";
import puppeteer from "puppeteer";

const KAMELEO_URL = "http://localhost:5050";
const PROFILE_ID = process.env.KAMELEO; // replace with your profile ID

// delay helper
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// check profile status
async function getProfileStatus() {
  const res = await axios.get(`${KAMELEO_URL}/profiles/${PROFILE_ID}`);
  return res.data.status?.lifetimeState || res.data.state;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const urlsParam = searchParams.get("urls");

  if (!urlsParam) {
    return NextResponse.json({ error: "Missing ?urls=" }, { status: 400 });
  }

  let urls;
  try {
    urls = JSON.parse(urlsParam);
  } catch {
    return NextResponse.json(
      { error: "Invalid ?urls=, must be JSON array" },
      { status: 400 }
    );
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { error: "?urls= must be a non-empty array" },
      { status: 400 }
    );
  }

  urls = urls.map((u) => (u.startsWith("//") ? "https:" + u : u));

  let browser;

  try {
    // ✅ ensure profile running
    let status = await getProfileStatus();
    if (status === "terminated") {
      await axios.post(
        `${KAMELEO_URL}/profiles/${PROFILE_ID}/start`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      let attempts = 0;
      while (status === "terminated" && attempts < 20) {
        await delay(500);
        status = await getProfileStatus();
        attempts++;
      }
    }

    // ✅ connect Puppeteer via Kameleo
    const browserWSEndpoint = `ws://localhost:5050/puppeteer/${PROFILE_ID}`;
    browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null,
    });

    // 🔹 Scrape function (uses its own tab per URL)
    const scrapeOne = async (productUrl) => {
      const page = await browser.newPage();
      let apiResponse = null;

      const waitForApi = new Promise((resolve) => {
        page.on("response", async (res) => {
          try {
            const req = res.request();
            if (
              req.resourceType() === "fetch" ||
              req.resourceType() === "xhr"
            ) {
              if (res.url().includes("mtop.global.detail.web.getdetailinfo")) {
                try {
                  const json = await res.json();
                  let moduleData = null;

                  if (json?.data?.module) {
                    moduleData =
                      typeof json.data.module === "string"
                        ? JSON.parse(json.data.module)
                        : json.data.module;
                  } else if (Array.isArray(json?.data?.modules)) {
                    moduleData =
                      typeof json.data.modules[0].module === "string"
                        ? JSON.parse(json.data.modules[0].module)
                        : json.data.modules[0].module;
                  }

                  apiResponse = moduleData;
                  resolve();
                } catch {}
              }
            }
          } catch {}
        });
      });

      await page.goto(productUrl, { waitUntil: "domcontentloaded" });
      await Promise.race([waitForApi, delay(20000)]);
      await page.close();

      if (!apiResponse?.productOption?.skuBase) {
        return {
          url: productUrl,
          error: "Unexpected Lazada response shape",
          raw: apiResponse,
        };
      }

      const variationValues =
        apiResponse.productOption.skuBase.properties.flatMap((p) => p.values);
      const vidToName = {};
      variationValues.forEach((v) => {
        vidToName[v.vid] = v.name;
      });

      const productName = apiResponse.tracking?.pdt_name || "Unknown product";
      const rawDescription =
        apiResponse.product?.desc || "No description found";
      const description = rawDescription
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const currency = apiResponse.tracking?.core?.currencyCode || "PHP";
      const variations = apiResponse.productOption.skuBase.skus.map((sku) => {
        const skuInfo = apiResponse.skuInfos?.[sku.skuId];
        let salePrice, originalPrice;

        if (skuInfo?.price) {
          if (skuInfo.price.salePrice?.text) {
            salePrice = skuInfo.price.salePrice.text;
          } else if (skuInfo.price.multiPrices?.length > 0) {
            salePrice = skuInfo.price.multiPrices[0].text;
          }
          if (skuInfo.price.originalPrice?.text) {
            originalPrice = skuInfo.price.originalPrice.text;
          }
        }

        let decodedProps = "Default";
        if (sku.propPath) {
          decodedProps = sku.propPath
            .split(";")
            .map((pair) => {
              const [pid, vid] = pair.split(":");
              return vidToName[vid] || vid;
            })
            .join(", ");
        }

        return {
          name: decodedProps,
          currency: currency,
          price: (salePrice || "0").replace(/[₱,]/g, ""),
          priceBeforeDiscount: (originalPrice || "0").replace(/[₱,]/g, ""),
          stock: skuInfo?.quantity?.limit?.max || null, // Get max orderable as "stock"
          sold: null, // Lazada API doesn't provide this here
        };
      });

      const numericPrices = variations
        .map((v) =>
          parseFloat(
            (v.salePrice || v.originalPrice || "").replace(/[₱,]/g, "")
          )
        )
        .filter((v) => !isNaN(v));

      const lowestPrice = Math.min(...numericPrices);
      const highestPrice = Math.max(...numericPrices);

      return {
        url: productUrl,
        title: productName, // Use "title" to match Shopee
        brand: apiResponse.product?.brand?.name || "Unknown", // Add brand
        description: description,
        location: "Unknown", // Add location to match
        rating: apiResponse.review?.averageRating || null, // Add rating
        currency: currency,
        lowestPrice,
        highestPrice,
        variations, 
      };
    };

    // 🔹 Run all scrapes in parallel
    const results = await Promise.all(urls.map((u) => scrapeOne(u)));

    await browser.disconnect();
    return NextResponse.json({ results });
  } catch (err) {
    console.error("ERROR:", err.message || err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.disconnect();
      } catch {}
    }
  }
}
