import { NextRequest, NextResponse } from "next/server";
import { db } from "./../../lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Missing customerId parameter" }, { status: 400 });
    }

    const snapshot = await db.collection("measurements")
      .where("customerId", "==", customerId)
      .orderBy("createdAt", "desc")
      .get();

    const measurements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: measurements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Automatically appends as a new historical record
    const docRef = await db.collection("measurements").add({
      ...body,
      isLatest: true, // Marker for frontend to easily find the most recent
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, data: { id: docRef.id, ...body } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}