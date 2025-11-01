import { NextResponse } from "next/server";
import axios from "axios";
import puppeteer from "puppeteer";

const KAMELEO_URL = "http://localhost:5050";
const PROFILE_ID = process.env.KAMELEO;

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getProfileStatus() {
  const res = await axios.get(`${KAMELEO_URL}/profiles/${PROFILE_ID}`);
  return res.data.status?.lifetimeState || res.data.state;
}

async function scrapeShopeeProduct(page, productUrl) {
  let apiData = null;

  const capturePromise = new Promise((resolve) => {
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("https://shopee.ph/api/v4/pdp/get_pc?")) {
        try {
          apiData = await response.json();
          resolve();
        } catch (err) {
          console.error("Failed to parse Shopee API response:", err.message);
        }
      }
    });
  });

  await page.goto(productUrl, {  timeout: 0 });

  await Promise.race([capturePromise, delay(8000)]);

  if (!apiData?.data?.item) {
    return {
      url: productUrl,
      error: "No product data found in Shopee API response",
      raw: apiData,
    };
  }

  const item = apiData.data.item;
  const models = item.models || [];

  const variations = models.map((m) => {
    const price = m.price / 100000;
    const priceBeforeDiscount = m.price_before_discount / 100000;
    return {
      name: m.name,
      currency: item.currency,
      price: price.toFixed(2),
      priceBeforeDiscount: priceBeforeDiscount.toFixed(2),
      stock: m.stock,
      sold: m.sold,
    };
  });

  const numericPrices = variations
    .map((v) => parseFloat(v.price))
    .filter((n) => !isNaN(n));

  const lowestPrice =
    numericPrices.length > 0 ? Math.min(...numericPrices) : null;
  const highestPrice =
    numericPrices.length > 0 ? Math.max(...numericPrices) : null;

  return {
    url: productUrl,
    title: item.title || item.name,
    brand: item.brand || "Unknown",
    description: item.description || "No description available",
    location: item.shop_location || "Unknown",
    rating: item.item_rating?.rating_star || null,
    currency: item.currency || "PHP",
    lowestPrice,
    highestPrice,
    variations,
  };
}

export async function POST(req) {
  let browser;

  try {
    const body = await req.json();
    const urls = body.urls;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "`urls` must be a non-empty array" },
        { status: 400 }
      );
    }

    // Start Kameleo profile if not active
    let status = await getProfileStatus();
    if (status === "terminated") {
      await axios.post(
        `${KAMELEO_URL}/profiles/${PROFILE_ID}/start`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      let attempts = 0;
      while (status === "terminated" && attempts < 10) {
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

    // ⚡ Run all scrapes in parallel
    const results = await Promise.all(
      urls.map(async (url) => {
        const page = await browser.newPage();
        try {
          const data = await scrapeShopeeProduct(page, url);
          await page.close();
          return data;
        } catch (err) {
          await page.close();
          return { url, error: err.message };
        }
      })
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
