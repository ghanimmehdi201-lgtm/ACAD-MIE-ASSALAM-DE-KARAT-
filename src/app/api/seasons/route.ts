import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { financialSeasons } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(financialSeasons).orderBy(desc(financialSeasons.id));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch seasons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Deactivate all other seasons
    await db.update(financialSeasons).set({ isActive: false });
    const inserted = await db
      .insert(financialSeasons)
      .values({
        name: body.name,
        startDate: body.startDate,
        endDate: body.endDate,
        openingBalance: body.openingBalance ?? "0",
        closingBalance: "0",
        isClosed: false,
        isActive: true,
        receiptVoucherCounter: 0,
        paymentVoucherCounter: 0,
        receiptCounter: 0,
      })
      .returning();
    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create season" }, { status: 500 });
  }
}
