import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin'; // Adjust path if yours is '../../lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const snapshot = await db.collection('payments').orderBy('createdAt', 'desc').get();
    
    const payments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // FIX 1: Safely convert Firebase Timestamp to a string so React doesn't crash on .split('T')
        invoiceDate: data.createdAt && typeof data.createdAt.toDate === 'function' 
          ? data.createdAt.toDate().toISOString() 
          : new Date().toISOString()
      };
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("Failed to fetch financial data:", error);
    return NextResponse.json({ success: false, error: "Database Connection Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.customerName || !body.orderId || body.totalAmount === undefined) {
      return NextResponse.json({ success: false, error: "Missing required invoice fields" }, { status: 400 });
    }

    const total = Number(body.totalAmount) || 0;
    const paid = Number(body.amountPaid) || 0;
    const balance = total - paid;
    
    let status = "Unpaid";
    if (paid >= total) status = "Paid";
    else if (paid > 0) status = "Partial";

    const paymentData = {
      customerName: body.customerName,
      orderId: body.orderId,
      totalAmount: total,
      amountPaid: paid,
      balance: balance,
      paymentMethod: body.paymentMethod || "Cash",
      status: status,
      notes: body.notes || "",
      createdAt: FieldValue.serverTimestamp(), // Saves exact server time in Firebase
    };

    // BATCH: Ensure the payment is saved AND the order balance is updated simultaneously
    const batch = db.batch();
    
    const paymentRef = db.collection('payments').doc();
    batch.set(paymentRef, paymentData);

    const orderRef = db.collection('orders').doc(body.orderId);
    batch.update(orderRef, {
      depositPaid: FieldValue.increment(paid),
      balance: balance
    });

    await batch.commit();

    // FIX 2: Strip out the Firebase 'FieldValue' object before sending to the client.
    // Next.js crashes if it tries to send raw database functions back to the frontend.
    const { createdAt, ...safePaymentData } = paymentData;

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: paymentRef.id, 
        ...safePaymentData, 
        invoiceDate: new Date().toISOString() // Provide a clean string for the table instantly
      } 
    });
  } catch (error) {
    console.error("Failed to process transaction:", error);
    return NextResponse.json({ success: false, error: "Failed to write to database" }, { status: 500 });
  }
}