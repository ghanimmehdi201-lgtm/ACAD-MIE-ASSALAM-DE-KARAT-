import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { receiptVouchers, cashBook, financialSeasons } from "@/db/schema";
import { eq } from "drizzle-orm";

async function recalcCashBook(seasonId: number) {
  const entries = await db
    .select()
    .from(cashBook)
    .where(eq(cashBook.seasonId, seasonId))
    .orderBy(cashBook.date, cashBook.id);

  const season = await db
    .select()
    .from(financialSeasons)
    .where(eq(financialSeasons.id, seasonId))
    .limit(1);

  let balance = parseFloat(season[0]?.openingBalance ?? "0");

  for (const entry of entries) {
    balance += parseFloat(entry.income ?? "0");
    balance -= parseFloat(entry.expense ?? "0");
    await db
      .update(cashBook)
      .set({ balance: balance.toFixed(2) })
      .where(eq(cashBook.id, entry.id));
  }

  await db
    .update(financialSeasons)
    .set({ closingBalance: balance.toFixed(2), updatedAt: new Date() })
    .where(eq(financialSeasons.id, seasonId));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(receiptVouchers)
      .where(eq(receiptVouchers.id, parseInt(id)));
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db
      .update(receiptVouchers)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(receiptVouchers.id, parseInt(id)))
      .returning();

    if (!updated.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Update cash book entry
    await db
      .update(cashBook)
      .set({
        date: body.date,
        referenceNumber: body.voucherNumber,
        description: `Reçu via ${body.voucherNumber} – ${body.reason || body.receivedFrom}`,
        descriptionAr: `تم الاستلام عبر ${body.voucherNumber} – ${body.reasonAr || body.receivedFromAr || body.receivedFrom}`,
        income: body.amount,
      })
      .where(eq(cashBook.documentId, parseInt(id)));

    await recalcCashBook(updated[0].seasonId);

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(receiptVouchers)
      .where(eq(receiptVouchers.id, parseInt(id)));
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const seasonId = rows[0].seasonId;

    await db.delete(cashBook).where(eq(cashBook.documentId, parseInt(id)));
    await db.delete(receiptVouchers).where(eq(receiptVouchers.id, parseInt(id)));

    await recalcCashBook(seasonId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
