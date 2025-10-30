import { db } from "@/database/drizzle";
import { UserLikes } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { snapshot } = await req.json();
    const { userId } = await auth();

    const { id, source, name, merchant, image, price, link } = snapshot;
    await db.insert(UserLikes).values({
      userId: userId,
      snapshot: snapshot,
    });

    return NextResponse.json({
      message: "Saved ",
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON or server error" });
  }
}

export async function DELETE(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { product_id } = await req.json();

    if (!product_id) {
      return NextResponse.json(
        { error: "Missing product_id" },
        { status: 400 }
      );
    }
    const likes = await db
      .select()
      .from(UserLikes)
      .where(eq(UserLikes.userId, userId));
    const target = likes.find(
      (row) => String(row.snapshot?.id) === String(product_id)
    );

    if (!target) {
      return NextResponse.json({ error: "Like not found" }, { status: 404 });
    }

    await db.delete(UserLikes).where(eq(UserLikes.id, target.id));

    return NextResponse.json({ message: "Like removed!" });
  } catch (error) {
    console.error("DELETE /api/likes error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const likes = await db
      .select()
      .from(UserLikes)
      .where(eq(UserLikes.userId, userId));

    const likedProducts = likes.map((like) => like.snapshot);

    return NextResponse.json({ likedProducts });
  } catch (error) {
    console.error("GET /api/likes failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}
