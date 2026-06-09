import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

// GET ALL INVOICES
export async function GET() {
  try {
    const snapshot = await db.collection("invoices").orderBy("issueDate", "desc").get();
    const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE NEW INVOICE
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Ensure financial fields are strictly numbers for accurate database math
    const newInvoice = {
      ...body,
      subtotal: Number(body.subtotal) || 0,
      tax: Number(body.tax) || 0,
      discount: Number(body.discount) || 0,
      grandTotal: Number(body.grandTotal) || 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("invoices").add(newInvoice);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...newInvoice } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}