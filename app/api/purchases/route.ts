import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

// GET ALL PURCHASES
export async function GET() {
  try {
    const snapshot = await db.collection("purchases").orderBy("date", "desc").get();
    const purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: purchases });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE NEW PURCHASE
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const newRecord = {
      ...body,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("purchases").add(newRecord);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...newRecord } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE PURCHASE
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing Purchase ID" }, { status: 400 });
    }

    await db.collection("purchases").doc(id).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, message: "Purchase updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE PURCHASE
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing Purchase ID" }, { status: 400 });
    }

    await db.collection("purchases").doc(id).delete();
    
    return NextResponse.json({ success: true, message: "Purchase deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}