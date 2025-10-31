import { db } from "@/database/drizzle";
import { comparisonsTb } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { eq, desc } from "drizzle-orm";
export async function POST(req) {
  try {
    const body = await req.json();

    const { snapshot, screenshot } = body || {};
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!snapshot) {
      return NextResponse.json({ error: "Missing snapshot" }, { status: 400 });
    }

    let screenshotUrl = null;
    if (screenshot) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `preview-${Date.now()}.png`;
      const filePath = path.join(uploadsDir, fileName);

      const base64Data = screenshot.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(filePath, base64Data, "base64");

      screenshotUrl = `/uploads/${fileName}`;
    }

    await db.insert(comparisonsTb).values({
      userId,
      searchId: "b9348865-8f0c-4bb0-942f-0a31e11121c2",
      snapshot: JSON.stringify(snapshot),
    });

    return NextResponse.json({ message: "Saved successfully!" });
  } catch (error) {
    console.error("❌ /api/history failed:", error);
    return NextResponse.json(
      { error: "Server crashed", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const comparisons = await db
      .select()
      .from(comparisonsTb)
      .where(eq(comparisonsTb.userId, userId))
      .orderBy(desc(comparisonsTb.createdAt));

    return NextResponse.json({
      success: true,
      data: comparisons,
      count: comparisons.length,
    });
  } catch (error) {
    console.error("❌ GET /api/history failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch history", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json(
        { error: `Invalid or missing JSON body ,${err}` },
        { status: 400 }
      );
    }

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing 'id' in request body" },
        { status: 400 }
      );
    }

    await db.delete(comparisonsTb).where(eq(comparisonsTb.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE /api/history failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
