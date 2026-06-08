import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase-admin";

// --- 1. GET: Fetches data for your table and SKU generator ---
export async function GET() {
  try {
    const snapshot = await db.collection("inventory").get();
    const items = snapshot.docs.map(doc => doc.data());
    
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- 2. POST: Saves newly registered items from your form ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const docId = body.id || `INV-${Date.now()}`;
    const itemRef = db.collection("inventory").doc(docId);

    const newItem = {
      ...body,
      id: docId,
      createdAt: new Date().toISOString(),
      logs: [] 
    };

    await itemRef.set(newItem);

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- 3. PATCH (Your Existing Code): Handles the +/- stock adjustment ---
export async function PATCH(req: NextRequest) {
  try {
    const { itemId, amount } = await req.json(); // amount can be 1 or -1

    if (!itemId || amount === undefined) {
      return NextResponse.json({ success: false, message: "Missing parameters" }, { status: 400 });
    }

    const itemRef = db.collection("inventory").doc(itemId);
    
    // TRANSACTION: Prevents stock from dropping below zero
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(itemRef);
      if (!doc.exists) {
        throw new Error("Item does not exist!");
      }

      const currentQuantity = Number(doc.data()?.quantity || 0);
      const newQuantity = currentQuantity + amount;

      if (newQuantity < 0) {
        throw new Error("Insufficient stock to perform this operation.");
      }

      transaction.update(itemRef, {
        quantity: newQuantity,
        lastUpdated: new Date().toISOString()
      });
    });

    return NextResponse.json({ success: true, message: "Stock adjusted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}