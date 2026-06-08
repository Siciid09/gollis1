import { NextRequest, NextResponse } from "next/server";
import { db } from "./../../lib/firebase-admin";

// GET ALL CUSTOMERS
export async function GET(req: NextRequest) {
  try {
    const snapshot = await db.collection("customers").orderBy("createdAt", "desc").get();
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE NEW CUSTOMER
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // STRICT VALIDATION: Check for duplicate phone numbers
    if (body.phone) {
      const existingCustomer = await db.collection("customers").where("phone", "==", body.phone).get();
      if (!existingCustomer.empty) {
        return NextResponse.json({ success: false, error: "A client with this phone number already exists." }, { status: 409 });
      }
    }
    
    const newCustomer = {
      ...body,
      status: "New",
      totalOrders: 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("customers").add(newCustomer);
    
    return NextResponse.json({ 
      success: true, 
      message: "Customer registered successfully",
      data: { id: docRef.id, ...newCustomer } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}