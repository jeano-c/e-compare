import { db } from "@/database/drizzle";
import { comparisonsTb } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("🧩 Received body:", body);

    const { snapshot } = body || {};
    const { userId } = await auth(); // no await!

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!snapshot) {
      return NextResponse.json({ error: "Missing snapshot" }, { status: 400 });
    }

    await db.insert(comparisonsTb).values({
      userId,
      searchId: "b448c5b9-2772-47f2-b0ac-72a698366145",
      snapshot: JSON.stringify(snapshot), // ensure valid JSON
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
