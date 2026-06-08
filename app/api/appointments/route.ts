import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/firebase-admin'; // Adjust to your Firebase init file
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    // Fetch appointments ordered by date
    const snapshot = await db.collection('appointments').orderBy('date', 'asc').get();
    
    const appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json({ success: false, error: "Database Connection Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerName || !body.date || !body.time || !body.type) {
      return NextResponse.json({ success: false, error: "Missing required scheduling fields" }, { status: 400 });
    }

    const appointmentData = {
      customerName: body.customerName,
      type: body.type, // "Measurement" | "Fitting" | "Pickup"
      date: body.date,
      time: body.time,
      assignedTo: body.assignedTo || "Unassigned",
      notes: body.notes || "",
      status: "Scheduled", // Default status
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('appointments').add(appointmentData);

    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...appointmentData } 
    });
  } catch (error) {
    console.error("Failed to schedule appointment:", error);
    return NextResponse.json({ success: false, error: "Failed to write to database" }, { status: 500 });
  }
}