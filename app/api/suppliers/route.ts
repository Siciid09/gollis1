import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

// GET ALL SUPPLIERS
export async function GET() {
  try {
    const snapshot = await db.collection("suppliers").orderBy("createdAt", "desc").get();
    const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE NEW SUPPLIER
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const newRecord = {
      ...body,
      outstandingBalance: Number(body.outstandingBalance) || 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("suppliers").add(newRecord);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...newRecord } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE SUPPLIER
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing Supplier ID" }, { status: 400 });
    }

    await db.collection("suppliers").doc(id).update({
      ...updateData,
      outstandingBalance: Number(body.outstandingBalance) || 0,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, message: "Supplier updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE SUPPLIER
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing Supplier ID" }, { status: 400 });
    }

    await db.collection("suppliers").doc(id).delete();
    
    return NextResponse.json({ success: true, message: "Supplier deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}