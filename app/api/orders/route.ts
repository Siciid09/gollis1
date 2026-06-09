import { NextRequest, NextResponse } from "next/server";
import { db } from "./../../lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, ...orderData } = body;

    // Use a Firestore Transaction or Batch to ensure data integrity
    const batch = db.batch();

    // 1. Create the new order
    const orderRef = db.collection("orders").doc();
    
    // STRICT VALIDATION: Cast inputs to numbers to prevent NaN database entries
    const total = Number(body.totalAmount) || 0;
    const deposit = Number(body.depositPaid) || 0;

    // Generate a short, readable ID for the physical plastic bag tag
    const physicalTag = `TAG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      ...orderData,
      customerId,
      status: "Pending",
      physicalTag, // Automatically inject the physical tag
      totalAmount: total,
      depositPaid: deposit,
      balance: total - deposit,
      createdAt: new Date().toISOString()
    };
    
    batch.set(orderRef, newOrder);

    // --- FINANCE MODULE INTEGRATION ---
    // If the customer pays a deposit upfront, automatically log it as Income
    if (deposit > 0) {
      const incomeRef = db.collection("income").doc();
      batch.set(incomeRef, {
        amount: deposit,
        source: "Tailoring Orders",
        description: `Upfront deposit for Order ${physicalTag}`,
        orderId: orderRef.id,
        customerId: customerId || "Walk-in",
        date: new Date().toISOString()
      });
    }

    // 2. Increment the customer's totalOrders count
    if (customerId) {
      const customerRef = db.collection("customers").doc(customerId);
      // Using Firebase Admin's FieldValue increment feature
      const { FieldValue } = require('firebase-admin/firestore');
      batch.update(customerRef, {
        totalOrders: FieldValue.increment(1),
        status: "Active"
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true, data: { id: orderRef.id, ...newOrder } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}