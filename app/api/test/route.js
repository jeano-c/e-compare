import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/database/drizzle";
import { searchTb } from "@/database/schema";
export async function POST(req) {
  const { userId } = getAuth(req);
  try {
    // Parse query params
    const { searchParams } = new URL(req.url);
    const urlsParam = searchParams.get("urls");

    if (!urlsParam) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    const urls = JSON.parse(decodeURIComponent(urlsParam));

    console.log("📦 Received URLs via query param:", urls);
    const [newSearch] = await db
      .insert(searchTb)
      .values({
        userId,
        query: "keyword",
      })
      .returning();

    // Simulate some processing
    await new Promise((r) => setTimeout(r, 2000));

    return NextResponse.json({
      message: "Batch processed successfully!",
      count: urls.length,
      urls,
      userId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Invalid URL param or server error" },
      { status: 400 }
    );
  }
}
