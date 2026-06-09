import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin"; // Adjust path to your firebase-admin file if needed

export async function GET() {
  try {
    // Fetch all income records, ordered by date (newest first)
    const snapshot = await db.collection("income").orderBy("date", "desc").get();
    const incomes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: incomes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Ensure amount is strictly a number for accurate math later
    const newIncome = {
      ...body,
      amount: Number(body.amount) || 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("income").add(newIncome);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...newIncome } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}