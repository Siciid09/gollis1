"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Scissors, DollarSign, PackageCheck, 
  TrendingUp, Clock, AlertTriangle, ArrowRight,
  Loader2, Activity, Layers, Tag, CheckCircle2,
  CalendarClock, Wallet, Award, ChevronRight, ShieldAlert, Lock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// --- TypeScript Interfaces ---
interface DashboardStats {
  totalCustomers: number;
  activeProduction: number;
  readyForPickup: number;
  completedOrders: number; // NEW
  totalRevenue: number;
  dailyRevenue: number;    // NEW
  pendingPayments: number; // NEW
  lowStockAlerts: number;
}

interface Order {
  id: string;
  customerName: string;
  garmentType: string;
  status: string;
  deliveryDate: string;
  dueInHours?: number; // Calculated field for alerts
}

interface InventoryAlert {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface EmployeeStat {
  id: string;
  name: string;
  role: string;
  completedJobs: number;
  efficiency: number; // Percentage score
}

export default function DashboardPage() {
  const router = useRouter();

  // --- State Management ---
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<Order[]>([]); // NEW
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStat[]>([]); // NEW
  const [isLoading, setIsLoading] = useState(true);

  // ---  State ---
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role?.toLowerCase();
          if (role === "admin" || role === "manager") {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Failed to verify security clearance:", error);
        setIsAuthorized(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // --- Dynamic Data Fetching ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel using allSettled to ensure partial loads
        const results = await Promise.allSettled([
          fetch('/api/dashboard'),
          fetch('/api/orders'),
          fetch('/api/inventory'),
          fetch('/api/employees') // Added real employee fetch
        ]);

        // Safely extract responses
        const statsRes = results[0].status === 'fulfilled' ? results[0].value : { ok: false };
        const ordersRes = results[1].status === 'fulfilled' ? results[1].value : { ok: false };
        const inventoryRes = results[2].status === 'fulfilled' ? results[2].value : { ok: false };
        const employeesRes = results[3].status === 'fulfilled' ? results[3].value : { ok: false };

        // 1. Set REAL KPI Stats
        if ((statsRes as Response).ok) {
          const statsJson = await (statsRes as Response).json();
          if (statsJson.success) setStats(statsJson.data);
          else setStats(null);
        } else setStats(null);

        // 2. Set REAL Employee Performance
        if ((employeesRes as Response).ok) {
          const empJson = await (employeesRes as Response).json();
          if (empJson.success) {
            const mappedEmps = empJson.data.map((e: any) => ({
              id: e.id,
              name: e.fullName || "Unknown",
              role: e.role || "Staff",
              completedJobs: e.completedJobs || 0,
              efficiency: e.efficiency || 100
            })).slice(0, 3); // Show top 3
            setEmployeeStats(mappedEmps);
          } else setEmployeeStats([]);
        } else setEmployeeStats([]);

        // 3. Set REAL Orders & Deliveries
        if ((ordersRes as Response).ok) {
          const ordersJson = await (ordersRes as Response).json();
          if (ordersJson.success) {
            const allOrders = ordersJson.data;
            setRecentOrders(allOrders.filter((o: Order) => ["Cutting", "Sewing", "Fitting"].includes(o.status)).slice(0, 5));
            
            // Urgent Deliveries from real data
            const urgent = allOrders.filter((o: Order) => ["Cutting", "Sewing", "Fitting", "Ready"].includes(o.status))
                                    .slice(0, 4);
            setUpcomingDeliveries(urgent);
          } else {
            setRecentOrders([]);
            setUpcomingDeliveries([]);
          }
        } else {
          setRecentOrders([]);
          setUpcomingDeliveries([]);
        }

        // 4. Set REAL Inventory Alerts
        if ((inventoryRes as Response).ok) {
          const invJson = await (inventoryRes as Response).json();
          if (invJson.success) {
            setInventoryAlerts(invJson.data.filter((i: any) => Number(i.quantity) <= Number(i.alertThreshold || 0)).slice(0, 4));
          } else setInventoryAlerts([]);
        } else setInventoryAlerts([]);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Utility Components ---
  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      Cutting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      Sewing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      Fitting: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status] || "bg-neutral-800 text-neutral-400"}`}>
        {status}
      </span>
    );
  };

  // --- LOADING STATE (Waits for Auth Check to finish) ---
  if (isAuthorized === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  // --- HARD BLOCK SCREEN FOR UNAUTHORIZED USERS ---
  if (isAuthorized === false) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden rounded-3xl border border-rose-500/10 bg-[#050505]">
        <div className="absolute inset-0 bg-rose-900 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500 via-rose-950 to-transparent" />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          transition={{ type: "spring", damping: 15 }}
          className="bg-rose-950/80 border-2 border-rose-500 p-8 md:p-12 rounded-3xl shadow-[0_0_100px_rgba(225,29,72,0.4)] backdrop-blur-xl max-w-lg w-full relative z-10"
        >
          <div className="w-20 h-20 bg-rose-500/10 border-2 border-rose-500 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
            <ShieldAlert size={40} />
            <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-20" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase tracking-widest">Access Denied</h1>
          <div className="h-px w-16 bg-rose-500 mx-auto mb-6" />
          <p className="text-rose-200/80 font-medium mb-8 text-sm leading-relaxed">
            Security clearance restricted. This module contains sensitive operational data. 
            Only <span className="text-white font-bold">Administrators</span> and <span className="text-white font-bold">Managers</span> are permitted to bypass this firewall.
          </p>
          <Link href="/" className="bg-rose-500 hover:bg-rose-600 text-white font-black px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95">
            <Lock size={18} /> Return to Safe Zone
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- NORMAL RENDER FOR ADMINS/MANAGERS ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/40 via-neutral-900/50 to-neutral-900/20 p-6 rounded-3xl border border-indigo-500/10 backdrop-blur-md shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-1">
            <Activity size={14} /> System Operations Core
            {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Enterprise Dashboard
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Live overview of manufacturing queues, revenue generation, and supply chain health.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/orders" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
            <Scissors size={14} /> New Order
          </Link>
          <Link href="/customers" className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2">
            <Users size={14} /> New Client
          </Link>
        </div>
      </div>

      {/* --- FINANCIAL / NEO-BRUTALIST ROW (New) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-500/5 border-2 border-emerald-500/30 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)] flex items-center justify-between transition-transform hover:-translate-y-1">
          <div>
             <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1 block">Daily Revenue (Today)</span>
             <h2 className="text-4xl font-black text-emerald-400 tracking-tight">
               {isLoading ? <span className="animate-pulse">...</span> : `$${stats?.dailyRevenue.toLocaleString()}`}
             </h2>
          </div>
          <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
             <TrendingUp size={28} className="text-emerald-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-500/5 border-2 border-rose-500/30 shadow-[4px_4px_0px_0px_rgba(244,63,94,0.2)] flex items-center justify-between transition-transform hover:-translate-y-1">
          <div>
             <span className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1 block">Pending Payments (Bal)</span>
             <h2 className="text-4xl font-black text-rose-400 tracking-tight">
               {isLoading ? <span className="animate-pulse">...</span> : `$${stats?.pendingPayments.toLocaleString()}`}
             </h2>
          </div>
          <div className="h-14 w-14 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
             <Wallet size={28} className="text-rose-400" />
          </div>
        </div>
      </div>

      {/* --- STANDARD KPI ROW --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active Production", value: stats?.activeProduction, icon: Scissors, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { title: "Ready for Pickup", value: stats?.readyForPickup, icon: PackageCheck, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
          { title: "Completed Orders", value: stats?.completedOrders, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { title: "Total Lifetime Rev", value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : undefined, icon: DollarSign, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 truncate pr-2">{stat.title}</span>
              <div className={`p-2 rounded-lg border ${stat.bg} ${stat.color} shrink-0`}>
                <stat.icon size={14} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white">
              {isLoading ? <div className="h-8 w-16 bg-neutral-800 animate-pulse rounded-md" /> : stat.value || "0"}
            </h2>
          </div>
        ))}
      </div>

      {/* --- MAIN OPERATIONAL SPLIT --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Queue & Performance (Spans 2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Priority Queue Table */}
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-neutral-950/30">
              <div className="flex items-center gap-2">
                <Layers className="text-indigo-400" size={16} />
                <h3 className="text-md font-bold text-white">Priority Queue Pipeline</h3>
              </div>
              <Link href="/orders" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-950/60 tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-bold">Order ID</th>
                    <th className="px-5 py-3 font-bold">Client</th>
                    <th className="px-5 py-3 font-bold">Garment</th>
                    <th className="px-5 py-3 font-bold">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-neutral-500"><Loader2 className="animate-spin inline mr-2"/> Loading queue...</td></tr>
                  ) : recentOrders.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-neutral-500 text-xs font-medium">No Active Production</td></tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-indigo-400 text-xs">{order.id}</td>
                        <td className="px-5 py-3 font-bold text-white text-xs">{order.customerName}</td>
                        <td className="px-5 py-3 text-neutral-300 font-medium text-xs">{order.garmentType}</td>
                        <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Performance Leaderboard (NEW) */}
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-neutral-950/30">
              <div className="flex items-center gap-2">
                <Award className="text-amber-400" size={16} />
                <h3 className="text-md font-bold text-white">Workshop Performance</h3>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
               {employeeStats.map((emp) => (
                 <div key={emp.id} className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                       <div>
                         <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                         <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">{emp.role}</span>
                       </div>
                       <div className="text-right">
                         <span className="text-xl font-black text-amber-400">{emp.completedJobs}</span>
                         <span className="block text-[9px] text-neutral-500 uppercase">Jobs Done</span>
                       </div>
                    </div>
                    {/* Efficiency Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-neutral-400">Efficiency</span>
                        <span className={emp.efficiency > 90 ? "text-emerald-400" : "text-amber-400"}>{emp.efficiency}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${emp.efficiency > 90 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${emp.efficiency}%` }} />
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Alerts & Operations */}
        <div className="space-y-6">
          
          {/* Upcoming Delivery Alerts (NEW) */}
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.03)] overflow-hidden">
            <div className="p-5 border-b border-rose-500/10 flex justify-between items-center bg-rose-500/5">
              <div className="flex items-center gap-2">
                <CalendarClock className="text-rose-400" size={16} />
                <h3 className="text-md font-bold text-white">Delivery Deadlines</h3>
              </div>
              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Next 48h</span>
            </div>
            <div className="p-4 space-y-3">
               {upcomingDeliveries.length === 0 ? (
                 <p className="text-xs text-neutral-500 text-center py-4">No urgent deliveries pending.</p>
               ) : (
                 upcomingDeliveries.map((order) => (
                   <div key={order.id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl relative overflow-hidden group">
                     {/* Urgency indicator strip */}
                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${(order.dueInHours || 0) < 24 ? "bg-rose-500" : "bg-amber-500"}`} />
                     <div className="pl-3 flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white text-xs mb-0.5">{order.customerName}</p>
                          <p className="text-[10px] text-neutral-500">{order.garmentType}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono font-bold text-[11px] ${(order.dueInHours || 0) < 24 ? "text-rose-400" : "text-amber-400"}`}>
                            {order.dueInHours}h left
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                     </div>
                   </div>
                 ))
               )}
            </div>
          </div>

          {/* Inventory Alerts Widget */}
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-neutral-950/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-400" size={16} />
                <h3 className="text-md font-bold text-white">Low Stock Vectors</h3>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {inventoryAlerts.length === 0 && !isLoading ? (
                <div className="text-center p-4 border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-xs font-medium">
                  Warehouse stock levels are nominal.
                </div>
              ) : (
                inventoryAlerts.map((item) => (
                  <div key={item.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 hover:border-amber-500/30 transition-colors">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-neutral-200 truncate pr-2">{item.name}</span>
                      <span className="text-amber-400 font-mono font-bold whitespace-nowrap">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-1">
                      <div className={`h-full rounded-full ${item.quantity === 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'}`} style={{ width: `${Math.max(5, (item.quantity / 10) * 100)}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}