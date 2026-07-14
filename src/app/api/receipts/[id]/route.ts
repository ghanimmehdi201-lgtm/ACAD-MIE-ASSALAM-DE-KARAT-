import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { receipts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db.select().from(receipts).where(eq(receipts.id, parseInt(id)));
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
      .update(receipts)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(receipts.id, parseInt(id)))
      .returning();
    if (!updated.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated[0]);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(receipts).where(eq(receipts.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
