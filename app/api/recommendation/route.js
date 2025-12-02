import { db } from "@/database/drizzle";
import { comparisonsTb, recommendationTb } from "@/database/schema";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

const ai = new GoogleGenAI({ apiKey: process.env.GENAI });

const promt = `Analyze this product data. Return a valid JSON object (no markdown) with this structure: { "index": number, "explanation": "string" }. The "index" must be the array index (0, 1, or 2) of the recommended product from the provided list. The "explanation" should be a short, brief evaluation of why it is the best.`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { comparisonId, reply } = body;

    const { userId } = await auth();

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
    return NextResponse.json({ details: err.message }, { status: 500 });
  }
}
