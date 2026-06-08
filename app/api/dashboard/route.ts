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
    // Creates a timestamp for midnight today to check against 'createdAt'
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    let activeProduction = 0;
    let readyForPickup = 0;
    let completedOrders = 0;
    let totalRevenue = 0;
    let dailyRevenue = 0;
    let pendingPayments = 0;

    // 3. Loop through orders ONCE to calculate all KPIs efficiently
    orders.forEach(o => {
      // --- Status Tracking ---
      if (["Cutting", "Sewing", "Fitting"].includes(o.status)) activeProduction++;
      if (o.status === "Ready") readyForPickup++;
      if (o.status === "Delivered") completedOrders++;

      // --- Financial Tracking ---
      const total = Number(o.totalAmount) || 0;
      const deposit = Number(o.depositPaid) || 0;
      // Fallback to total - deposit if balance wasn't explicitly saved
      const balance = Number(o.balance) || (total - deposit);

      totalRevenue += total;
      pendingPayments += Math.max(0, balance); // Ensure no negative balances skew the data

      // --- Daily Revenue Check ---
      if (o.createdAt && o.createdAt >= startOfToday) {
        dailyRevenue += total;
      }
    });

    const lowStockAlerts = inventorySnap.docs.length;

    // 4. Send the complete package back to the frontend
    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        activeProduction,
        readyForPickup,
        completedOrders,
        totalRevenue,
        dailyRevenue,      // Now matches your frontend
        pendingPayments,   // Now matches your frontend
        lowStockAlerts
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}