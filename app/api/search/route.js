import { NextResponse } from "next/server";
import axios from "axios";
import puppeteer from "puppeteer";
import { db } from "@/database/drizzle";
import { searchTb } from "@/database/schema";
import { getAuth } from "@clerk/nextjs/server";
const KAMELEO_URL = "http://localhost:5050";
const PROFILE_ID = "c4e6c249-8dea-4550-8a92-f70bb33b64b9";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getProfileStatus() {
  const res = await axios.get(`${KAMELEO_URL}/profiles/${PROFILE_ID}`);
  return res.data.status?.lifetimeState || res.data.state;
}

export async function GET(req) {
  const { userId } = getAuth(req);
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || "powerbank";
  console.log(userId);
  
  if (userId) {
    const [newSearch] = await db
      .insert(searchTb)
      .values({
        userId,
        query: keyword,
      })
      .returning();
  }

  let lazadaData = null;
  let shopeeData = null;

  try {
    console.log("> Checking profile status...");
    let status = await getProfileStatus();

    if (status === "terminated") {
      console.log("> Starting profile...");
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
      console.log("> Profile started!");
    }

    const browserWSEndpoint = `ws://localhost:5050/puppeteer/${PROFILE_ID}`;
    console.log("> Connecting Puppeteer...");
    const browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null,
    });

    const lazadaPage = await browser.newPage();
    const shopeePage = await browser.newPage();

    const lazadaUrl = `https://www.lazada.com.ph/tag/${encodeURIComponent(
      keyword.replace(/\s+/g, "-")
    )}?q=${encodeURIComponent(keyword)}&catalog_redirect_tag=true`;

    const shopeeUrl = `https://shopee.ph/search?keyword=${encodeURIComponent(
      keyword
    )}`;

    // Lazada capture
    const lazadaPromise = new Promise((resolve) => {
      lazadaPage.on("response", async (response) => {
        const req = response.request();
        if (
          (req.resourceType() === "xhr" || req.resourceType() === "fetch") &&
          response.url().includes("https://www.lazada.com.ph/tag/")
        ) {
          try {
            lazadaData = await response.json();
            resolve();
          } catch (err) {
            console.error("> Lazada parse failed:", err.message);
          }
        }
      });
    });

    // Shopee capture
    const shopeePromise = new Promise((resolve) => {
      shopeePage.on("response", async (response) => {
        if (response.url().includes("/api/v4/search/search_items")) {
          try {
            shopeeData = await response.json();
            resolve();
          } catch (err) {
            console.error("> Shopee parse failed:", err.message);
          }
        }
      });
    });

    console.log("> Navigating to Lazada + Shopee...");
    await Promise.all([
      lazadaPage.goto(lazadaUrl, { waitUntil: "domcontentloaded", timeout: 0 }),
      shopeePage.goto(shopeeUrl, { waitUntil: "domcontentloaded", timeout: 0 }),
    ]);

    await Promise.race([
      Promise.all([lazadaPromise, shopeePromise]),
      delay(7000),
    ]);

    if (!lazadaData) {
      try {
        const finalUrl = lazadaPage.url();
        console.log("> Lazada fallback - final URL:", finalUrl);

        const html = await lazadaPage.content();
        const snippet = html.slice(0, 20_000); // limit size

        lazadaData = {
          fallback: true,
          finalUrl,
          htmlSnippet: snippet,
        };
      } catch (err) {
        console.error("> Lazada fallback failed:", err.message);
      }
    }

    await lazadaPage.close();
    await shopeePage.close();
    await browser.disconnect();

    return NextResponse.json({
      keyword,
      lazada: lazadaData,
      shopee: shopeeData,
    });
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message || err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
