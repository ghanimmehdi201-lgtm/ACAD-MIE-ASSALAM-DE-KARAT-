import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cashBook } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get("seasonId");

    if (!seasonId) {
      return NextResponse.json({ error: "seasonId required" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(cashBook)
      .where(eq(cashBook.seasonId, parseInt(seasonId)))
      .orderBy(asc(cashBook.date), asc(cashBook.id));

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch cash book" }, { status: 500 });
  }
}
