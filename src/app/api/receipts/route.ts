import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { receipts, financialSeasons } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get("seasonId");
    const search = searchParams.get("search") ?? "";

    if (seasonId) {
      const rows = await db
        .select()
        .from(receipts)
        .where(eq(receipts.seasonId, parseInt(seasonId)))
        .orderBy(desc(receipts.id));
      if (search) {
        const s = search.toLowerCase();
        return NextResponse.json(
          rows.filter(
            (r) =>
              r.receiptNumber.toLowerCase().includes(s) ||
              r.fullName.toLowerCase().includes(s) ||
              r.reason?.toLowerCase().includes(s) ||
              r.nationalId?.toLowerCase().includes(s)
          )
        );
      }
      return NextResponse.json(rows);
    }

    const rows = await db.select().from(receipts).orderBy(desc(receipts.id));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const seasonId = body.seasonId;

    await db
      .update(financialSeasons)
      .set({
        receiptCounter: sql`receipt_counter + 1`,
        updatedAt: new Date(),
      })
      .where(eq(financialSeasons.id, seasonId));

    const inserted = await db
      .insert(receipts)
      .values({
        seasonId: body.seasonId,
        receiptNumber: body.receiptNumber,
        date: body.date,
        fullName: body.fullName,
        fullNameAr: body.fullNameAr ?? "",
        nationalId: body.nationalId ?? "",
        address: body.address ?? "",
        addressAr: body.addressAr ?? "",
        amount: body.amount,
        amountInWords: body.amountInWords ?? "",
        amountInWordsAr: body.amountInWordsAr ?? "",
        reason: body.reason ?? "",
        reasonAr: body.reasonAr ?? "",
        paymentMethod: body.paymentMethod ?? "cash",
        notes: body.notes ?? "",
      })
      .returning();

    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
  }
}
