import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse query params
    const { searchParams } = new URL(req.url);
    const urlsParam = searchParams.get("urls");

    if (!urlsParam) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    // Decode and parse the array of URLs
    const urls = JSON.parse(decodeURIComponent(urlsParam));

    console.log("📦 Received URLs via query param:", urls);

    // Simulate some processing
    await new Promise((r) => setTimeout(r, 2000));

    return NextResponse.json({
      message: "Batch processed successfully!",
      count: urls.length,
      urls,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Invalid URL param or server error" },
      { status: 400 }
    );
  }
}
