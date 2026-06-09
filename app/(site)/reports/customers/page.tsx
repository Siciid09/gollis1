"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Users, UserPlus, UserCheck, Activity, 
  Search, Printer, Loader2, Download, PieChart, 
  MapPin, Phone
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart as RePieChart, Pie
} from "recharts";

interface CustomerRecord {
  id: string;
  fullName: string;
  phone: string;
  gender: string;
  address: string;
  createdAt: string;
  totalOrders: number;
}

export default function CustomerReportPage() {
  const [masterData, setMasterData] = useState<any>(null);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch Father API and Detailed API concurrently
      const [reportRes, customersRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/customers')
      ]);
      
      const reportJson = await reportRes.json();
      const customersJson = await customersRes.json();
      
      if (reportJson.success) setMasterData(reportJson.data);
      if (customersJson.success) setCustomers(customersJson.data);
    } catch (error) {
      console.error("Failed to fetch customer report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Analytics Math ---
  const activeCustomers = customers.filter(c => c.totalOrders > 0).length;
  const newCustomers = customers.filter(c => {
    if (!c.createdAt) return false;
    const diffTime = Math.abs(new Date().getTime() - new Date(c.createdAt).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30; // Within last 30 days
  }).length;

  const topSpenders = [...customers].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 5);

  const genderData = [
    { name: 'Male', value: customers.filter(c => c.gender === 'Male').length, color: '#6366f1' }, // Indigo
    { name: 'Female', value: customers.filter(c => c.gender === 'Female').length, color: '#ec4899' }, // Pink
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

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
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold tracking-widest uppercase mb-1">
              <PieChart size={14} /> Demographics & Growth
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Customer Analytics</h1>
          </div>
          <div className="flex gap-3 no-print">
            <button onClick={() => window.print()} className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
              <Printer size={16} /> Export PDF
            </button>
          </div>
        </header>

        {/* Gradient KPI Cards (Blue/Indigo Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Total Registered Database", value: masterData?.customers?.total || 0, icon: <Users size={20} className="text-blue-100" />, bg: "bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-500/30" },
            { title: "Active Clients (With Orders)", value: activeCustomers.toString(), icon: <UserCheck size={20} className="text-indigo-100" />, bg: "bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-500/30" },
            { title: "New Acquisitions (30 Days)", value: newCustomers.toString(), icon: <UserPlus size={20} className="text-emerald-100" />, bg: "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500/30" },
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

        {/* Charts & Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gender Split Chart */}
          <div className="lg:col-span-1 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2"><Activity size={16} className="text-blue-400"/> Gender Distribution</h3>
            <div className="flex-1 min-h-[250px] w-full relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-neutral-500"/></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }} />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {genderData.map(g => (
                <div key={g.name} className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }}/> {g.name} ({g.value})
                </div>
              ))}
            </div>
          </div>

          {/* Top Loyal Customers Table */}
          <div className="lg:col-span-2 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2"><UserCheck size={16} className="text-emerald-400"/> Most Loyal Clients (By Volume)</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-[10px] text-neutral-500 uppercase border-b border-white/10">
                   <tr>
                     <th className="pb-3 font-bold">Client Name</th>
                     <th className="pb-3 font-bold">Contact</th>
                     <th className="pb-3 font-bold">Location</th>
                     <th className="pb-3 font-bold text-right">Lifetime Orders</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {isLoading ? (
                     <tr><td colSpan={4} className="py-8 text-center text-neutral-500"><Loader2 className="animate-spin inline mr-2"/> Processing ranking...</td></tr>
                   ) : topSpenders.map((cust, idx) => (
                     <tr key={cust.id}>
                       <td className="py-4 font-bold text-white flex items-center gap-3">
                         <span className="text-neutral-500 font-mono text-xs">#{idx + 1}</span> {cust.fullName}
                       </td>
                       <td className="py-4 text-xs text-neutral-400"><span className="flex items-center gap-1"><Phone size={10}/> {cust.phone}</span></td>
                       <td className="py-4 text-xs text-neutral-400"><span className="flex items-center gap-1"><MapPin size={10}/> {cust.address || "N/A"}</span></td>
                       <td className="py-4 text-right">
                         <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold text-xs border border-emerald-500/20">{cust.totalOrders} Orders</span>
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