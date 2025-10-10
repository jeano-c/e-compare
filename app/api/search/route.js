import { NextResponse } from "next/server";
import axios from "axios";
import puppeteer from "puppeteer";

const KAMELEO_URL = "http://localhost:5050";
const PROFILE_ID = "ac8c2564-dac7-46cf-acdf-448d67a1327b";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getProfileStatus() {
  const res = await axios.get(`${KAMELEO_URL}/profiles/${PROFILE_ID}`);
  return res.data.status?.lifetimeState || res.data.state;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || "powerbank";

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
      keyword
    )}`;
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
      lazadaPage.goto(lazadaUrl, { waitUntil: "domcontentloaded" }),
      shopeePage.goto(shopeeUrl, { waitUntil: "domcontentloaded" }),
    ]);

    // Wait for both responses or timeout
    await Promise.race([
      Promise.all([lazadaPromise, shopeePromise]),
      delay(7000),
    ]);

    // Fallback: if lazadaData wasn't captured via XHR, try to capture final
    // page URL and some page content that can help parse results client-side.
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
