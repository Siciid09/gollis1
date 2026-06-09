import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData = {
      ...body,
      amount: Number(body.amount) || 0, // Ensure it stays a number
      updatedAt: new Date().toISOString()
    };

    await db.collection("income").doc(id).update(updateData);
    
    return NextResponse.json({ success: true, message: "Income record updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.collection("income").doc(id).delete();
    
    return NextResponse.json({ success: true, message: "Income record deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}