"use client";

import React, { useState, useEffect } from "react";
import { 
  Box, AlertTriangle, Layers, TrendingDown, 
  Search, Printer, Loader2, DollarSign, Package
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  alertThreshold: number;
  cost: number;
}

export default function InventoryReportPage() {
  const [masterData, setMasterData] = useState<any>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const [reportRes, invRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/inventory')
      ]);
      
      const reportJson = await reportRes.json();
      const invJson = await invRes.json();
      
      if (reportJson.success) setMasterData(reportJson.data);
      if (invJson.success) setInventory(invJson.data);
    } catch (error) {
      console.error("Failed to fetch inventory report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Analytics Math ---
  const criticalStock = inventory.filter(item => Number(item.quantity) <= Number(item.alertThreshold));

  // Group by Category for Pie Chart
  const categoryData = inventory.reduce((acc: any, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = { name: cat, value: 0 };
    acc[cat].value += 1; // Count SKUs per category
    return acc;
  }, {});
  
  const pieData = Object.values(categoryData);
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']; // Cyan, Emerald, Amber, Violet, Pink

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

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
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Package size={14} /> Warehouse Logistics
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Inventory Analytics</h1>
          </div>
          <div className="flex gap-3 no-print">
            <button onClick={() => window.print()} className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
              <Printer size={16} /> Export PDF
            </button>
          </div>
        </header>

        {/* Gradient KPI Cards (Cyan/Blue Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Capital Tied in Stock", value: `$${(masterData?.inventory?.capitalInStock || 0).toLocaleString()}`, icon: <DollarSign size={20} className="text-emerald-100" />, bg: "bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-500/30" },
            { title: "Total Unique SKUs", value: masterData?.inventory?.totalSKUs || 0, icon: <Layers size={20} className="text-cyan-100" />, bg: "bg-gradient-to-br from-cyan-600 to-blue-600 border-cyan-500/30" },
            { title: "Critical Stock Alerts", value: masterData?.inventory?.lowStockAlerts || 0, icon: <AlertTriangle size={20} className="text-amber-100" />, bg: "bg-gradient-to-br from-orange-500 to-red-500 border-orange-500/30" },
          ].map((card, i) => (
            <div key={i} className={`p-6 rounded-2xl ${card.bg} border shadow-xl relative overflow-hidden transition-all hover:scale-[1.02]`}>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 drop-shadow-sm">{card.title}</span>
                <div className="p-2 bg-black/20 rounded-lg backdrop-blur-md">{card.icon}</div>
              </div>
              <h2 className="text-4xl font-black text-white relative z-10 drop-shadow-md">
                {isLoading ? <div className="h-10 w-16 bg-white/20 animate-pulse rounded-md" /> : card.value}
              </h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Category Distribution Chart */}
          <div className="lg:col-span-1 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2"><Layers size={16} className="text-cyan-400"/> Stock Distribution</h3>
            <div className="flex-1 min-h-[250px] w-full relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-neutral-500"/></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.map((g: any, i: number) => (
                <div key={g.name} className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}/> {g.name} ({g.value})
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Depletion Warning Table */}
          <div className="lg:col-span-2 bg-neutral-900/40 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-orange-400"/> Critical Depletion Matrix</h3>
             <p className="text-xs text-neutral-500 mb-6">Materials that have fallen below their safe operational threshold.</p>
             
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-[10px] text-neutral-500 uppercase border-b border-white/10">
                   <tr>
                     <th className="pb-3 font-bold">Material Name</th>
                     <th className="pb-3 font-bold">Category</th>
                     <th className="pb-3 font-bold text-center">Current Qty</th>
                     <th className="pb-3 font-bold text-right">Threshold</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {isLoading ? (
                     <tr><td colSpan={4} className="py-8 text-center text-neutral-500"><Loader2 className="animate-spin inline mr-2"/> Auditing stock...</td></tr>
                   ) : criticalStock.length === 0 ? (
                     <tr><td colSpan={4} className="py-8 text-center text-emerald-500 font-bold">All stock levels are healthy!</td></tr>
                   ) : criticalStock.map((item) => (
                     <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="py-4 font-bold text-white">{item.name}</td>
                       <td className="py-4 text-xs text-neutral-400">{item.category}</td>
                       <td className="py-4 text-center">
                         <span className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full font-bold text-[10px] border border-rose-500/20">{item.quantity}</span>
                       </td>
                       <td className="py-4 text-right">
                         <span className="text-neutral-500 font-mono text-xs">{item.alertThreshold}</span>
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