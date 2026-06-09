import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData = {
      ...body,
      amount: Number(body.amount) || 0, 
      updatedAt: new Date().toISOString()
    };

    await db.collection("expenses").doc(id).update(updateData);
    
    return NextResponse.json({ success: true, message: "Expense record updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.collection("expenses").doc(id).delete();
    
    return NextResponse.json({ success: true, message: "Expense record deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}