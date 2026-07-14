import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { financialSeasons, cashBook, receiptVouchers, paymentVouchers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(financialSeasons)
      .where(eq(financialSeasons.id, parseInt(id)));
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch season" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.isActive === true) {
      await db.update(financialSeasons).set({ isActive: false });
    }

    const updated = await db
      .update(financialSeasons)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(financialSeasons.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update season" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sid = parseInt(id);

    // Delete cash book entries
    await db.delete(cashBook).where(eq(cashBook.seasonId, sid));
    // Delete vouchers
    await db.delete(receiptVouchers).where(eq(receiptVouchers.seasonId, sid));
    await db.delete(paymentVouchers).where(eq(paymentVouchers.seasonId, sid));

    await db.delete(financialSeasons).where(eq(financialSeasons.id, sid));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete season" }, { status: 500 });
  }
}
