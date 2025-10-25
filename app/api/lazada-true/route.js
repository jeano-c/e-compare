import { NextResponse } from "next/server";
import axios from "axios";
import puppeteer from "puppeteer";

const KAMELEO_URL = "http://localhost:5050";
const PROFILE_ID = "c4e6c249-8dea-4550-8a92-f70bb33b64b9";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getProfileStatus() {
  const res = await axios.get(`${KAMELEO_URL}/profiles/${PROFILE_ID}`);
  return res.data.status?.lifetimeState || res.data.state;
}

// Detect platform from URL
function detectPlatform(url) {
  if (url.includes("lazada.com")) return "lazada";
  if (url.includes("shopee.ph")) return "shopee";
  return "unknown";
}

// Lazada scraper
async function scrapeLazada(browser, productUrl) {
  const page = await browser.newPage();
  let apiResponse = null;

  const waitForApi = new Promise((resolve) => {
    page.on("response", async (res) => {
      try {
        const req = res.request();
        if (req.resourceType() === "fetch" || req.resourceType() === "xhr") {
          if (res.url().includes("https://acs-m.lazada.com.ph/h5")) {
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

  await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 0 });
  await Promise.race([waitForApi, delay(10000)]);
  await page.close();

  if (!apiResponse?.productOption?.skuBase) {
    return {
      platform: "lazada",
      url: productUrl,
      error: "Unexpected Lazada response shape",
      raw: apiResponse,
    };
  }

  const variationValues = apiResponse.productOption.skuBase.properties.flatMap(
    (p) => p.values
  );
  const vidToName = {};
  variationValues.forEach((v) => {
    vidToName[v.vid] = v.name;
  });

  const productName = apiResponse.tracking?.pdt_name || "Unknown product";

  const variations = apiResponse.productOption.skuBase.skus.map((sku) => {
    const skuInfo = apiResponse.skuInfos?.[sku.skuId];
    let salePrice, originalPrice, discount;

    if (skuInfo?.price) {
      if (skuInfo.price.salePrice?.text) {
        salePrice = skuInfo.price.salePrice.text;
      } else if (skuInfo.price.multiPrices?.length > 0) {
        salePrice = skuInfo.price.multiPrices[0].text;
      }

      if (skuInfo.price.originalPrice?.text) {
        originalPrice = skuInfo.price.originalPrice.text;
      }

      if (skuInfo.price.discount) {
        discount = skuInfo.price.discount;
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
      skuId: sku.skuId,
      variation: decodedProps,
      salePrice,
      originalPrice,
      discount,
    };
  });

  const numericPrices = variations
    .map((v) =>
      parseFloat((v.salePrice || v.originalPrice || "").replace(/[₱,]/g, ""))
    )
    .filter((v) => !isNaN(v));

  const lowestPrice = Math.min(...numericPrices);
  const highestPrice = Math.max(...numericPrices);

  return {
    platform: "lazada",
    url: productUrl,
    product: productName,
    lowestPrice,
    highestPrice,
    variations,
  };
}

// Shopee scraper
async function scrapeShopee(browser, productUrl) {
  const page = await browser.newPage();
  let apiData = null;

  const capturePromise = new Promise((resolve) => {
    page.on("response", async (response) => {
      if (response.url().includes("https://shopee.ph/api/v4/pdp/get_pc?")) {
        try {
          apiData = await response.json();
          resolve();
        } catch (err) {
          console.error("Failed to parse Shopee API response:", err.message);
        }
      }
    });
  });

  await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 0 });
  await Promise.race([capturePromise, delay(8000)]);
  await page.close();

  if (!apiData?.data?.item?.models) {
    return {
      platform: "shopee",
      url: productUrl,
      error: "No models found in Shopee response",
      raw: apiData,
    };
  }

  const models = apiData.data.item.models;

  const variations = models.map((m) => {
    const price = m.price / 100000;
    const priceBeforeDiscount = m.price_before_discount / 100000;

    return {
      name: m.name,
      currency: apiData.data.item.currency,
      price: price.toFixed(2),
      priceBeforeDiscount: priceBeforeDiscount.toFixed(2),
      stock: m.stock,
      sold: m.sold,
    };
  });

  const numericPrices = variations
    .map((v) => parseFloat(v.price))
    .filter((n) => !isNaN(n));

  const lowestPrice = Math.min(...numericPrices);
  const highestPrice = Math.max(...numericPrices);

  return {
    platform: "shopee",
    url: productUrl,
    product: apiData.data.item.name,
    lowestPrice,
    highestPrice,
    variations,
  };
}

// Main scraper that routes to correct platform
async function scrapeProduct(browser, url) {
  const platform = detectPlatform(url);

  if (platform === "lazada") {
    return scrapeLazada(browser, url);
  } else if (platform === "shopee") {
    return scrapeShopee(browser, url);
  } else {
    return {
      platform: "unknown",
      url,
      error: "Unsupported platform. Only Lazada and Shopee are supported.",
    };
  }
}

export async function POST(req) {
  let browser;

  try {
    const body = await req.json();
    let urls = body.urls;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "`urls` must be a non-empty array" },
        { status: 400 }
      );
    }

    // Normalize URLs (handle protocol-relative URLs)
    urls = urls.map((u) => (u.startsWith("//") ? "https:" + u : u));

    // Start profile if needed
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

    // Connect Puppeteer via Kameleo
    const browserWSEndpoint = `ws://localhost:5050/puppeteer/${PROFILE_ID}`;
    browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null,
    });

    // Scrape all URLs in parallel
    const results = await Promise.all(
      urls.map((url) => scrapeProduct(browser, url))
    );

    await browser.disconnect();

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Unexpected error" },
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
