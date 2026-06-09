import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET() {
  try {
    // Fetch all expense records, ordered by date (newest first)
    const snapshot = await db.collection("expenses").orderBy("date", "desc").get();
    const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Ensure amount is strictly a number
    const newExpense = {
      ...body,
      amount: Number(body.amount) || 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("expenses").add(newExpense);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...newExpense } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}