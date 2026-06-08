import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/firebase-admin'; // Adjust to your Firebase init file
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    // Implement cursor pagination
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const cursor = url.searchParams.get("cursor"); // Use a document's createdAt timestamp as cursor

    let query = db.collection('catalog').orderBy('createdAt', 'desc').limit(limit);
    
    if (cursor) {
      query = query.startAfter(cursor);
    }

    const snapshot = await query.get();
    
    const catalogItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: catalogItems });
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json({ success: false, error: "Database Connection Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.category) {
      return NextResponse.json({ success: false, error: "Missing required catalog fields" }, { status: 400 });
    }

    const catalogData = {
      name: body.name,
      category: body.category, // e.g., "Menswear", "Womenswear", "Uniforms"
      basePrice: Number(body.basePrice) || 0,
      measurementTemplate: body.measurementTemplate || "Unisex", // "Male", "Female", "Unisex"
      description: body.description || "",
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('catalog').add(catalogData);

    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...catalogData } 
    });
  } catch (error) {
    console.error("Failed to add catalog item:", error);
    return NextResponse.json({ success: false, error: "Failed to write to database" }, { status: 500 });
  }
}