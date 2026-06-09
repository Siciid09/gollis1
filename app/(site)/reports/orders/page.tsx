"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Scissors, Clock, CheckCircle2, PackageCheck, 
  Printer, Loader2, AlertTriangle, TrendingUp, Layers
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell
} from "recharts";

interface OrderRecord {
  id: string;
  customerName: string;
  garmentType: string;
  status: string;
  deliveryDate: string;
  totalAmount: number;
}

export default function OrderReportPage() {
  const [masterData, setMasterData] = useState<any>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch Father API and Detailed API concurrently
      const [reportRes, ordersRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/orders')
      ]);
      
      const reportJson = await reportRes.json();
      const ordersJson = await ordersRes.json();
      
      if (reportJson.success) setMasterData(reportJson.data);
      if (ordersJson.success) setOrders(ordersJson.data);
    } catch (error) {
      console.error("Failed to fetch order report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Analytics Math ---
  const pipelineData = [
    { name: 'Pending', value: masterData?.orders?.pending || 0, color: '#f59e0b' }, // Amber
    { name: 'In Progress', value: masterData?.orders?.inProgress || 0, color: '#8b5cf6' }, // Violet
    { name: 'Ready', value: masterData?.orders?.ready || 0, color: '#10b981' }, // Emerald
    { name: 'Delivered', value: masterData?.orders?.completed || 0, color: '#0ea5e9' }, // Cyan
  ];

  // Identify Bottlenecks (Orders due in the next 48 hours that are NOT ready/delivered)
  const today = new Date();
  const warningDate = new Date(today);
  warningDate.setDate(warningDate.getDate() + 2); // 48 hours from now

  const bottleneckOrders = orders.filter(o => {
    if (o.status === "Ready" || o.status === "Delivered") return false;
    const due = new Date(o.deliveryDate);
    return due <= warningDate;
  }).sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #report-content, #report-content * { visibility: visible; }
          #report-content { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; background: #050505; color: white; }
          .no-print { display: none !important; }
        }
      `}} />

      <div id="report-content" className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Layers size={14} /> Production Efficiency
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Order & Pipeline Analytics</h1>
          </div>
          <div className="flex gap-3 no-print">
            <button onClick={() => window.print()} className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
              <Printer size={16} /> Export PDF
            </button>
          </div>
        </header>

        {/* Gradient KPI Cards (Violet/Fuchsia Theme) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Lifetime Orders", value: masterData?.orders?.total || 0, icon: <Layers size={20} className="text-indigo-100" />, bg: "bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-500/30" },
            { title: "Pending Queue", value: masterData?.orders?.pending || 0, icon: <Clock size={20} className="text-amber-100" />, bg: "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-500/30" },
            { title: "Active Production", value: masterData?.orders?.inProgress || 0, icon: <Scissors size={20} className="text-violet-100" />, bg: "bg-gradient-to-br from-violet-600 to-fuchsia-600 border-violet-500/30" },
            { title: "Successfully Delivered", value: masterData?.orders?.completed || 0, icon: <PackageCheck size={20} className="text-emerald-100" />, bg: "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500/30" },
          ].map((card, i) => (
            <div key={i} className={`p-5 rounded-2xl ${card.bg} border shadow-xl relative overflow-hidden transition-all hover:scale-[1.02]`}>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 drop-shadow-sm">{card.title}</span>
                <div className="p-2 bg-black/20 rounded-lg backdrop-blur-md">{card.icon}</div>
              </div>
              <h2 className="text-4xl font-black text-white relative z-10 drop-shadow-md">
                {isLoading ? <div className="h-10 w-16 bg-white/20 animate-pulse rounded-md" /> : card.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Charts & Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pipeline Bar Chart */}
          <div className="lg:col-span-1 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2"><TrendingUp size={16} className="text-violet-400"/> Production Pipeline</h3>
            <div className="flex-1 min-h-[250px] w-full">
              {isLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-neutral-500"/></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#999', fontSize: 10}} />
                    <YAxis stroke="#666" tick={{fill: '#999', fontSize: 10}} allowDecimals={false} />
                    <RechartsTooltip cursor={{fill: '#222'}} contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Critical Bottleneck Alert Table */}
          <div className="lg:col-span-2 bg-neutral-900/40 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-rose-400"/> Bottleneck Report</h3>
             <p className="text-xs text-neutral-500 mb-6">Orders due within 48 hours that are not yet marked as Ready.</p>
             
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-[10px] text-neutral-500 uppercase border-b border-white/10">
                   <tr>
                     <th className="pb-3 font-bold">Client Name</th>
                     <th className="pb-3 font-bold">Garment</th>
                     <th className="pb-3 font-bold">Current Node</th>
                     <th className="pb-3 font-bold text-right">Deadline</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {isLoading ? (
                     <tr><td colSpan={4} className="py-8 text-center text-neutral-500"><Loader2 className="animate-spin inline mr-2"/> Scanning pipeline...</td></tr>
                   ) : bottleneckOrders.length === 0 ? (
                     <tr><td colSpan={4} className="py-8 text-center text-emerald-500 font-bold"><CheckCircle2 className="inline mr-2" size={16}/> No production bottlenecks detected!</td></tr>
                   ) : bottleneckOrders.map((order) => (
                     <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="py-4 font-bold text-white">{order.customerName}</td>
                       <td className="py-4 text-xs text-neutral-300">{order.garmentType}</td>
                       <td className="py-4">
                         <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full font-bold text-[10px] uppercase border border-amber-500/20">{order.status}</span>
                       </td>
                       <td className="py-4 text-right">
                         <span className="text-rose-400 font-mono font-bold text-xs">{order.deliveryDate}</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}