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
  totalOrders: number;
  pendingOrders: number;
  ordersInProgress: number;
  readyOrders: number;
  deliveredOrders: number;
  revenueToday: number;
  revenueThisMonth: number;
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

export default function DashboardPage() {
  const router = useRouter();

  // --- State Management ---
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<Order[]>([]); 
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
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
          fetch('/api/inventory')
        ]);

        // Safely extract responses
        const statsRes = results[0].status === 'fulfilled' ? results[0].value : { ok: false };
        const ordersRes = results[1].status === 'fulfilled' ? results[1].value : { ok: false };
        const inventoryRes = results[2].status === 'fulfilled' ? results[2].value : { ok: false };

        // 1. Set REAL KPI Stats
        if ((statsRes as Response).ok) {
          const statsJson = await (statsRes as Response).json();
          if (statsJson.success) setStats(statsJson.data);
          else setStats(null);
        } else setStats(null);

        // 2. Set REAL Orders & Deliveries
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

      {/* --- GRADIENT KPI ROW (Exact Scope) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Customers", value: stats?.totalCustomers || 0, icon: <Users size={20} className="text-blue-200" />, gradient: "from-blue-600 to-cyan-500 border-blue-500/30 shadow-blue-500/20" },
          { title: "Total Orders", value: stats?.totalOrders || 0, icon: <Layers size={20} className="text-indigo-200" />, gradient: "from-indigo-600 to-purple-500 border-indigo-500/30 shadow-indigo-500/20" },
          { title: "Pending Orders", value: stats?.pendingOrders || 0, icon: <Clock size={20} className="text-amber-200" />, gradient: "from-amber-600 to-orange-500 border-amber-500/30 shadow-amber-500/20" },
          { title: "Orders In Progress", value: stats?.ordersInProgress || 0, icon: <Scissors size={20} className="text-rose-200" />, gradient: "from-rose-600 to-pink-500 border-rose-500/30 shadow-rose-500/20" },
          { title: "Ready Orders", value: stats?.readyOrders || 0, icon: <CheckCircle2 size={20} className="text-emerald-200" />, gradient: "from-emerald-600 to-teal-500 border-emerald-500/30 shadow-emerald-500/20" },
          { title: "Delivered Orders", value: stats?.deliveredOrders || 0, icon: <PackageCheck size={20} className="text-cyan-200" />, gradient: "from-cyan-600 to-blue-500 border-cyan-500/30 shadow-cyan-500/20" },
          { title: "Revenue Today", value: `$${stats?.revenueToday?.toLocaleString() || 0}`, icon: <TrendingUp size={20} className="text-green-200" />, gradient: "from-green-600 to-emerald-500 border-green-500/30 shadow-green-500/20" },
          { title: "Revenue This Month", value: `$${stats?.revenueThisMonth?.toLocaleString() || 0}`, icon: <Wallet size={20} className="text-violet-200" />, gradient: "from-violet-600 to-purple-500 border-violet-500/30 shadow-violet-500/20" },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-5 rounded-2xl border bg-gradient-to-br ${card.gradient} shadow-lg flex flex-col gap-3 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider drop-shadow-sm">{card.title}</span>
              <div className="p-2 bg-black/20 rounded-lg backdrop-blur-sm">
                {card.icon}
              </div>
            </div>
            <h2 className="text-3xl font-black text-white relative z-10 drop-shadow-md">
              {isLoading ? <div className="h-8 w-16 bg-white/20 animate-pulse rounded-md" /> : card.value}
            </h2>
          </motion.div>
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