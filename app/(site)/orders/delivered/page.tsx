"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, PackageCheck, Clock, Tag, Loader2, CheckCircle2 
} from "lucide-react";

// --- TypeScript Interfaces ---
interface Order {
  id: string;
  customerName: string;
  customerId: string;
  physicalTag: string;
  garmentType: string;
  fabric: string;
  quantity: number | string;
  status: string;
  total: number;
  deposit: number;
  deliveryDate: string;
}

export default function DeliveredOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Dynamic Data Fetching ---
  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        // Strictly filter to only keep Delivered orders
        const deliveredOnly = json.data.filter((o: Order) => o.status === "Delivered");
        setOrders(deliveredOnly);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch delivered orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Search Logic ---
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(order => {
      return typeof searchQuery !== "undefined" && searchQuery
        ? order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.physicalTag && order.physicalTag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
    });
  }, [orders, searchQuery]);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">
              <PackageCheck size={14} /> Historical Archive
              {isLoading && <Loader2 size={12} className="animate-spin ml-2 text-emerald-500" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Delivered Orders
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              A permanent record of successfully completed and handed-over garments.
            </p>
          </div>
        </header>

        {/* --- Toolbar --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 w-full md:w-96 pr-1">
            <div className="w-full relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search historical records by ID, name, or tag..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2 pl-9 pr-4 text-white text-sm transition-all outline-none" 
              />
            </div>
          </div>
          
          <div className="px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400">
            Total Delivered: <span className="text-emerald-400">{orders.length}</span>
          </div>
        </div>

        {/* --- Data View: Table List --- */}
        <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Order Vector</th>
                  <th className="px-6 py-5 font-bold">Client Profile</th>
                  <th className="px-6 py-5 font-bold">Blueprint & Materials</th>
                  <th className="px-6 py-5 font-bold">Fulfilled Date</th>
                  <th className="px-6 py-5 font-bold">Financials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2 opacity-50" />
                      Retrieving archives...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">
                      No delivered orders match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-mono font-bold text-emerald-400 text-xs">{order.id}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-neutral-800 text-neutral-500 border-neutral-700 w-fit">
                            {order.status}
                          </span>
                          {order.physicalTag && (
                            <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <Tag size={10} /> {order.physicalTag}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{order.customerName || "Unknown"}</span>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5">{order.customerId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-200">
                            {order.garmentType} 
                            <span className="text-emerald-400 font-bold ml-1.5 text-xs">x{order.quantity || 1}</span>
                          </span>
                          <span className="text-xs text-neutral-500 mt-0.5">{order.fabric}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-neutral-300">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="font-mono text-xs">{order.deliveryDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-white text-xs">${order.total}</span>
                          <span className="text-[10px] text-neutral-500">
                            Paid: <span className="text-emerald-400">${order.deposit}</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}