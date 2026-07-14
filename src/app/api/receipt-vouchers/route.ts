import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { receiptVouchers, cashBook, financialSeasons } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

async function recalcCashBook(seasonId: number) {
  // Get all cash book entries for season ordered by date and id
  const entries = await db
    .select()
    .from(cashBook)
    .where(eq(cashBook.seasonId, seasonId))
    .orderBy(cashBook.date, cashBook.id);

  // Get opening balance
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

  // Update closing balance
  await db
    .update(financialSeasons)
    .set({ closingBalance: balance.toFixed(2), updatedAt: new Date() })
    .where(eq(financialSeasons.id, seasonId));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get("seasonId");
    const search = searchParams.get("search") ?? "";

    let query = db.select().from(receiptVouchers);
    if (seasonId) {
      const rows = await db
        .select()
        .from(receiptVouchers)
        .where(eq(receiptVouchers.seasonId, parseInt(seasonId)))
        .orderBy(desc(receiptVouchers.id));
      if (search) {
        const s = search.toLowerCase();
        return NextResponse.json(
          rows.filter(
            (r) =>
              r.voucherNumber.toLowerCase().includes(s) ||
              r.receivedFrom.toLowerCase().includes(s) ||
              r.reason?.toLowerCase().includes(s) ||
              r.nationalId?.toLowerCase().includes(s) ||
              r.position?.toLowerCase().includes(s)
          )
        );
      }
      return NextResponse.json(rows);
    }

    const rows = await db.select().from(receiptVouchers).orderBy(desc(receiptVouchers.id));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch receipt vouchers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const seasonId = body.seasonId;

    // Increment counter
    await db
      .update(financialSeasons)
      .set({
        receiptVoucherCounter: sql`receipt_voucher_counter + 1`,
        updatedAt: new Date(),
      })
      .where(eq(financialSeasons.id, seasonId));

    const inserted = await db
      .insert(receiptVouchers)
      .values({
        seasonId: body.seasonId,
        voucherNumber: body.voucherNumber,
        date: body.date,
        receivedFrom: body.receivedFrom,
        receivedFromAr: body.receivedFromAr ?? "",
        nationalId: body.nationalId ?? "",
        position: body.position ?? "",
        positionAr: body.positionAr ?? "",
        amount: body.amount,
        amountInWords: body.amountInWords ?? "",
        amountInWordsAr: body.amountInWordsAr ?? "",
        reason: body.reason ?? "",
        reasonAr: body.reasonAr ?? "",
        paymentMethod: body.paymentMethod ?? "cash",
        chequeNumber: body.chequeNumber ?? "",
        attachmentTypes: body.attachmentTypes ?? [],
        notes: body.notes ?? "",
      })
      .returning();

    // Add cash book entry
    await db.insert(cashBook).values({
      seasonId,
      date: body.date,
      referenceNumber: body.voucherNumber,
      description: `Reçu via ${body.voucherNumber} – ${body.reason || body.receivedFrom}`,
      descriptionAr: `تم الاستلام عبر ${body.voucherNumber} – ${body.reasonAr || body.receivedFromAr || body.receivedFrom}`,
      income: body.amount,
      expense: "0",
      balance: "0",
      documentType: "receipt_voucher",
      documentId: inserted[0].id,
    });

    await recalcCashBook(seasonId);

    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create receipt voucher" }, { status: 500 });
  }
}
