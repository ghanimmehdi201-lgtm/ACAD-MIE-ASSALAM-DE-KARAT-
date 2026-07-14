import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { paymentVouchers, cashBook, financialSeasons } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get("seasonId");
    const search = searchParams.get("search") ?? "";

    if (seasonId) {
      const rows = await db
        .select()
        .from(paymentVouchers)
        .where(eq(paymentVouchers.seasonId, parseInt(seasonId)))
        .orderBy(desc(paymentVouchers.id));
      if (search) {
        const s = search.toLowerCase();
        return NextResponse.json(
          rows.filter(
            (r) =>
              r.voucherNumber.toLowerCase().includes(s) ||
              r.paidTo.toLowerCase().includes(s) ||
              r.purpose?.toLowerCase().includes(s) ||
              r.nationalId?.toLowerCase().includes(s) ||
              r.position?.toLowerCase().includes(s)
          )
        );
      }
      return NextResponse.json(rows);
    }

    const rows = await db.select().from(paymentVouchers).orderBy(desc(paymentVouchers.id));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch payment vouchers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const seasonId = body.seasonId;

    await db
      .update(financialSeasons)
      .set({
        paymentVoucherCounter: sql`payment_voucher_counter + 1`,
        updatedAt: new Date(),
      })
      .where(eq(financialSeasons.id, seasonId));

    const inserted = await db
      .insert(paymentVouchers)
      .values({
        seasonId: body.seasonId,
        voucherNumber: body.voucherNumber,
        date: body.date,
        paidTo: body.paidTo,
        paidToAr: body.paidToAr ?? "",
        nationalId: body.nationalId ?? "",
        position: body.position ?? "",
        positionAr: body.positionAr ?? "",
        amount: body.amount,
        amountInWords: body.amountInWords ?? "",
        amountInWordsAr: body.amountInWordsAr ?? "",
        purpose: body.purpose ?? "",
        purposeAr: body.purposeAr ?? "",
        paymentMethod: body.paymentMethod ?? "cash",
        chequeNumber: body.chequeNumber ?? "",
        attachmentTypes: body.attachmentTypes ?? [],
        notes: body.notes ?? "",
      })
      .returning();

    await db.insert(cashBook).values({
      seasonId,
      date: body.date,
      referenceNumber: body.voucherNumber,
      description: `Payé via ${body.voucherNumber} – ${body.purpose || body.paidTo}`,
      descriptionAr: `تم الصرف عبر ${body.voucherNumber} – ${body.purposeAr || body.paidToAr || body.paidTo}`,
      income: "0",
      expense: body.amount,
      balance: "0",
      documentType: "payment_voucher",
      documentId: inserted[0].id,
    });

    await recalcCashBook(seasonId);

    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create payment voucher" }, { status: 500 });
  }
}
