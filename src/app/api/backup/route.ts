import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  associationSettings,
  financialSeasons,
  receiptVouchers,
  paymentVouchers,
  receipts,
  cashBook,
  attachments,
} from "@/db/schema";

export async function GET() {
  try {
    const [settings, seasons, rvs, pvs, recs, cb, att] = await Promise.all([
      db.select().from(associationSettings),
      db.select().from(financialSeasons),
      db.select().from(receiptVouchers),
      db.select().from(paymentVouchers),
      db.select().from(receipts),
      db.select().from(cashBook),
      db.select().from(attachments),
    ]);

    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data: {
        settings,
        seasons,
        receiptVouchers: rvs,
        paymentVouchers: pvs,
        receipts: recs,
        cashBook: cb,
        attachments: att,
      },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="maams-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to export backup" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.data) {
      return NextResponse.json({ error: "Invalid backup format" }, { status: 400 });
    }

    const { data } = body;

    // Clear existing data (in order due to FK constraints)
    await db.delete(cashBook);
    await db.delete(attachments);
    await db.delete(receiptVouchers);
    await db.delete(paymentVouchers);
    await db.delete(receipts);
    await db.delete(financialSeasons);
    await db.delete(associationSettings);

    // Restore
    if (data.settings?.length) await db.insert(associationSettings).values(data.settings);
    if (data.seasons?.length) await db.insert(financialSeasons).values(data.seasons);
    if (data.receiptVouchers?.length) await db.insert(receiptVouchers).values(data.receiptVouchers);
    if (data.paymentVouchers?.length) await db.insert(paymentVouchers).values(data.paymentVouchers);
    if (data.receipts?.length) await db.insert(receipts).values(data.receipts);
    if (data.cashBook?.length) await db.insert(cashBook).values(data.cashBook);
    if (data.attachments?.length) await db.insert(attachments).values(data.attachments);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to import backup" }, { status: 500 });
  }
}
