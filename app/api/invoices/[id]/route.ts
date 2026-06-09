import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

// UPDATE SPECIFIC INVOICE
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData = {
      ...body,
      subtotal: Number(body.subtotal) || 0,
      tax: Number(body.tax) || 0,
      discount: Number(body.discount) || 0,
      grandTotal: Number(body.grandTotal) || 0,
      updatedAt: new Date().toISOString()
    };

    await db.collection("invoices").doc(id).update(updateData);
    
    return NextResponse.json({ success: true, message: "Invoice updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE SPECIFIC INVOICE
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.collection("invoices").doc(id).delete();
    
    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}