import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { associationSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(associationSettings).limit(1);
    if (rows.length === 0) {
      // Create default settings
      const inserted = await db
        .insert(associationSettings)
        .values({
          name: "Mon Association",
          nameAr: "جمعيتي",
          currency: "MAD",
          numberingSystem: "french",
          receiptVoucherPrefix: "BR",
          paymentVoucherPrefix: "BC",
          receiptPrefix: "R",
          numberFormat: "0001/YYYY",
          numberingMode: "season",
          interfaceLanguage: "fr",
          documentLanguage: "bilingual",
          registerLanguage: "bilingual",
        })
        .returning();
      return NextResponse.json(inserted[0]);
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = await db.select().from(associationSettings).limit(1);

    if (rows.length === 0) {
      const inserted = await db.insert(associationSettings).values(body).returning();
      return NextResponse.json(inserted[0]);
    }

    const updated = await db
      .update(associationSettings)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(associationSettings.id, rows[0].id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
