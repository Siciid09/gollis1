import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch EVERYTHING at the exact same time for maximum performance
    const [
      customersSnap,
      ordersSnap,
      inventorySnap,
      incomeSnap,
      expensesSnap,
      suppliersSnap
    ] = await Promise.all([
      db.collection("customers").get(),
      db.collection("orders").get(),
      db.collection("inventory").get(),
      db.collection("income").get(),
      db.collection("expenses").get(),
      db.collection("suppliers").get()
    ]);

    // ==========================================
    // 2. DATA PROCESSING & AGGREGATION
    // ==========================================

    // --- CUSTOMER METRICS ---
    const totalCustomers = customersSnap.size;

    // --- ORDER METRICS ---
    let totalOrders = ordersSnap.size;
    let pendingOrders = 0;
    let inProgressOrders = 0;
    let readyOrders = 0;
    let completedOrders = 0;
    let totalCustomerDebt = 0; // Money customers owe you

    ordersSnap.forEach(doc => {
      const order = doc.data();
      
      // Status breakdown based on strict scope
      if (order.status === "Pending") pendingOrders++;
      else if (["Cutting", "Stitching", "Finishing"].includes(order.status)) inProgressOrders++;
      else if (order.status === "Ready") readyOrders++;
      else if (order.status === "Delivered") completedOrders++;
      
      // Calculate outstanding customer balances
      totalCustomerDebt += Math.max(0, Number(order.balance) || 0);
    });

    // --- FINANCE METRICS ---
    let totalIncome = 0;
    incomeSnap.forEach(doc => { 
      totalIncome += Number(doc.data().amount) || 0; 
    });

    let totalExpenses = 0;
    expensesSnap.forEach(doc => { 
      totalExpenses += Number(doc.data().amount) || 0; 
    });

    // The Golden Metric: Profit
    const netProfit = totalIncome - totalExpenses;

    // --- INVENTORY METRICS ---
    let totalStockItems = inventorySnap.size;
    let lowStockCount = 0;
    let totalInventoryValue = 0;

    inventorySnap.forEach(doc => {
      const item = doc.data();
      const qty = Number(item.quantity) || 0;
      const threshold = Number(item.alertThreshold) || 10;
      const cost = Number(item.cost) || 0;

      if (qty <= threshold) lowStockCount++;
      totalInventoryValue += (qty * cost); // Capital tied up in fabric/materials
    });

    // --- SUPPLIER METRICS ---
    let totalSuppliers = suppliersSnap.size;
    let totalSupplierDebt = 0; // Money you owe to suppliers

    suppliersSnap.forEach(doc => {
      totalSupplierDebt += Number(doc.data().outstandingBalance) || 0;
    });

    // ==========================================
    // 3. THE "FATHER" JSON RESPONSE
    // ==========================================
    const masterReport = {
      customers: {
        total: totalCustomers
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        inProgress: inProgressOrders,
        ready: readyOrders,
        completed: completedOrders,
      },
      finance: {
        income: totalIncome,
        expenses: totalExpenses,
        profit: netProfit,
        accountsReceivable: totalCustomerDebt, // Owed to you
        accountsPayable: totalSupplierDebt     // Owed by you
      },
      inventory: {
        totalSKUs: totalStockItems,
        lowStockAlerts: lowStockCount,
        capitalInStock: totalInventoryValue
      },
      suppliers: {
        total: totalSuppliers
      }
    };

    return NextResponse.json({ success: true, data: masterReport });

  } catch (error: any) {
    console.error("Master Report Generation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}