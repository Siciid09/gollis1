import { NextRequest, NextResponse } from 'next/server';
import { db } from "./../../lib/firebase-admin";
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const snapshot = await db.collection('employees').orderBy('createdAt', 'desc').get();
    
    const employees = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json({ success: false, error: "Database Connection Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.fullName || !body.role || !body.phone) {
      return NextResponse.json({ success: false, error: "Missing required personnel fields" }, { status: 400 });
    }

    // STRICT VALIDATION: Ensure salary is a valid, non-negative number
    const safeSalary = Math.max(0, Number(body.salary) || 0);

    const employeeData = {
      fullName: body.fullName,
      role: body.role,
      phone: body.phone,
      salary: safeSalary,
      skills: body.skills || "",
      activeJobs: 0, 
      completedJobs: 0,
      status: "Active",
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('employees').add(employeeData);

    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...employeeData, createdAt: new Date().toISOString() } 
    });
  } catch (error) {
    console.error("Failed to register employee:", error);
    return NextResponse.json({ success: false, error: "Failed to write to database" }, { status: 500 });
  }
}