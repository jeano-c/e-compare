import { db } from "@/database/drizzle";
import { comparisonsTb, recommendationTb } from "@/database/schema";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
const ai = new GoogleGenAI({ apiKey: process.env.GENAI });
const promt = `based on this data what is the best one to get each product has variation so take account on those too and the prices if there anomaly on them you can say it to me and reply you your breif evaluation and what is the best one to get just reply the one you recomend no need for long explanation just short explanation`;
export async function POST(req) {
  try {
    const body = await req.json();
    const { comparisonId, reply } = body;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const [comparison] = await db
      .select()
      .from(comparisonsTb)
      .where(eq(comparisonsTb.id, comparisonId));

    if (!comparison) {
      return NextResponse.json(
        { error: "Comparison not found or invalid ID" },
        { status: 404 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${promt}  ${JSON.stringify(reply)}`,
    });
    await db.insert(recommendationTb).values({
      comparisionId: comparisonId,
      aiRecomendation: response.text,
    });
    return NextResponse.json({ message: response.text });
  } catch (err) {
    return NextResponse.json({ details: err.message });
  }
}
