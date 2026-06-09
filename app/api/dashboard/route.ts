import { NextResponse, NextRequest } from "next/server";
import { db } from "../../lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch data in parallel
    // We added "depositPaid", "balance", and "createdAt" so we can calculate the new financials
    const [customersSnap, ordersSnap, inventorySnap] = await Promise.all([
      db.collection("customers").count().get(),
      db.collection("orders").select("status", "totalAmount", "depositPaid", "balance", "createdAt").get(),
      db.collection("inventory").where("quantity", "<=", 10).get()
    ]);

    const totalCustomers = customersSnap.data().count;
    const orders = ordersSnap.docs.map(doc => doc.data());
    
    // 2. Set up variables for our calculations
    const now = new Date();
    // Date boundaries for financial tracking
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString(); 

    const totalOrders = orders.length;
    let pendingOrders = 0;
    let ordersInProgress = 0;
    let readyOrders = 0;
    let deliveredOrders = 0;
    
    let revenueToday = 0;
    let revenueThisMonth = 0;

    // 3. Loop through orders ONCE to calculate all KPIs efficiently
    orders.forEach(o => {
      // --- Strict Scope Status Tracking ---
      if (o.status === "Pending") pendingOrders++;
      // Groups Cutting, Stitching, and Finishing
      if (["Cutting", "Stitching", "Finishing"].includes(o.status)) ordersInProgress++;
      if (o.status === "Ready") readyOrders++;
      if (o.status === "Delivered") deliveredOrders++;

      // --- Financial Tracking ---
      const total = Number(o.totalAmount) || 0;

      // --- Time-based Revenue Checks ---
      if (o.createdAt) {
        if (o.createdAt >= startOfToday) {
          revenueToday += total;
        }
        if (o.createdAt >= startOfMonth) {
          revenueThisMonth += total;
        }
      }
    });

    const lowStockAlerts = inventorySnap.docs.length;

    // 4. Send the complete package back to the frontend
    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalOrders,
        pendingOrders,
        ordersInProgress,
        readyOrders,
        deliveredOrders,
        revenueToday,
        revenueThisMonth,
        lowStockAlerts
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}