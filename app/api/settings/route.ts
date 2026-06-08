import { NextRequest, NextResponse } from "next/server";
import { db } from "./../../lib/firebase-admin"; // Ensure this path correctly points to your Firebase Admin init file

// Use a single, deterministic document ID for global app settings
const SETTINGS_DOC_ID = "global_config";

export async function GET() {
  try {
    const docRef = await db.collection("settings").doc(SETTINGS_DOC_ID).get();
    
    if (!docRef.exists) {
      // Return null or default structure if no settings have been saved yet
      return NextResponse.json({ success: true, data: null });
    }
    
    return NextResponse.json({ success: true, data: docRef.data() });
  } catch (error: any) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Upsert (update or insert) the global configuration.
    // { merge: true } ensures we only update the fields provided in the request
    // without wiping out other nested data that might exist in the document.
    await db.collection("settings").doc(SETTINGS_DOC_ID).set({
      ...body,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, message: "Settings synced successfully" });
  } catch (error: any) {
    console.error("Failed to sync settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}