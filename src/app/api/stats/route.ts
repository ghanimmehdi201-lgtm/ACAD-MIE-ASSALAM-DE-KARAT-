import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { receiptVouchers, paymentVouchers, receipts, financialSeasons } from "@/db/schema";
import { eq, sum } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get("seasonId");

    if (!seasonId) {
      return NextResponse.json({ error: "seasonId required" }, { status: 400 });
    }

    const sid = parseInt(seasonId);

    const [rvRows, pvRows, rRows, seasonRows] = await Promise.all([
      db.select().from(receiptVouchers).where(eq(receiptVouchers.seasonId, sid)),
      db.select().from(paymentVouchers).where(eq(paymentVouchers.seasonId, sid)),
      db.select().from(receipts).where(eq(receipts.seasonId, sid)),
      db.select().from(financialSeasons).where(eq(financialSeasons.id, sid)),
    ]);

    const totalIncome = rvRows.reduce((acc, r) => acc + parseFloat(r.amount ?? "0"), 0);
    const totalExpenses = pvRows.reduce((acc, r) => acc + parseFloat(r.amount ?? "0"), 0);
    const season = seasonRows[0];
    const openingBalance = parseFloat(season?.openingBalance ?? "0");
    const currentBalance = openingBalance + totalIncome - totalExpenses;

    // Monthly stats (last 6 months)
    const monthlyStats: Record<string, { income: number; expense: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyStats[key] = { income: 0, expense: 0 };
    }

    rvRows.forEach((r) => {
      const month = r.date?.substring(0, 7);
      if (month && monthlyStats[month] !== undefined) {
        monthlyStats[month].income += parseFloat(r.amount ?? "0");
      }
    });

    pvRows.forEach((r) => {
      const month = r.date?.substring(0, 7);
      if (month && monthlyStats[month] !== undefined) {
        monthlyStats[month].expense += parseFloat(r.amount ?? "0");
      }
    });

    return NextResponse.json({
      currentBalance,
      totalIncome,
      totalExpenses,
      openingBalance,
      receiptVoucherCount: rvRows.length,
      paymentVoucherCount: pvRows.length,
      receiptCount: rRows.length,
      season,
      monthlyStats,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
