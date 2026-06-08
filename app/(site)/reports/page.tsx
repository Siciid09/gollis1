"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, Users, Scissors, 
  DollarSign, Download, Calendar, ArrowUpRight, 
  ArrowDownRight, Loader2, Award, Box, ShieldAlert, Lock
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7D" | "1M" | "3M" | "YTD">("1M");

  // --- RBAC (Role-Based Access Control) State ---
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Dynamic State for Charts
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [garmentData, setGarmentData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<any[]>([]);

  // 1. Check Authorization First
  useEffect(() => {
    const checkSecurityClearance = () => {
      const userRole = localStorage.getItem("userRole"); 
      
      // Bounce to auth if completely logged out
      if (!userRole) {
        router.push("/auth");
        return;
      }

      // Show Red Block Screen if logged in but lacks clearance
      if (userRole === "admin" || userRole === "manager") {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };
    checkSecurityClearance();
  }, [router]);

  // 2. Fetch Data ONLY if Authorized
  useEffect(() => {
    // If not authorized yet, do not attempt to fetch from the API!
    if (isAuthorized !== true) return;

    const fetchAggregatedStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/reports?range=${dateRange}`);
        if (!res.ok) throw new Error("API Route not available");
        
        const json = await res.json();
        
        if (json.success && json.data) {
          setRevenueData(json.data.revenueData || []);
          setGarmentData(json.data.garmentData || []);
          setTopCustomers(json.data.topCustomers || []);
          setEmployeePerformance(json.data.employeePerformance || []);
        }
      } catch (error) {
        console.error("Failed to load aggregated stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAggregatedStats();
  }, [dateRange, isAuthorized]);

  // --- Custom Tooltip for Charts ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-700 p-3 rounded-xl shadow-2xl">
          <p className="text-white font-bold text-xs mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[11px] font-mono mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-neutral-400 capitalize">{entry.name}:</span>
              <span className="text-white font-bold">
                {entry.name === "revenue" ? `$${entry.value.toLocaleString()}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // --- LOADING STATE ---
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
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
            Security clearance restricted. This module contains sensitive financial and operational analytics. 
            Only <span className="text-white font-bold">Administrators</span> and <span className="text-white font-bold">Managers</span> are permitted to bypass this firewall.
          </p>
          
          <div className="flex justify-center w-full mt-6">
            <Link href="/" className="inline-flex w-max mx-auto bg-rose-600 hover:bg-rose-500 text-white font-black px-8 py-3.5 rounded-xl transition-all items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95">
              <Lock size={18} /> Return to Safe Zone
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- NORMAL RENDER FOR ADMINS/MANAGERS ---
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- Header & Controls --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">
              <BarChart3 size={14} /> Intelligence & Analytics
              {isLoading && <Loader2 size={12} className="animate-spin text-emerald-400 ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Business Reports
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Comprehensive financial metrics, labor efficiency, and demographic growth data.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Time Filter Toggle */}
            <div className="flex bg-neutral-950 border border-neutral-800 rounded-xl p-1 shadow-inner w-full sm:w-auto">
              {["7D", "1M", "3M", "YTD"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none ${
                    dateRange === range 
                      ? "bg-neutral-800 text-white shadow-md border border-neutral-700" 
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Export Actions */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Download size={14} /> CSV
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
                <Download size={14} /> PDF Report
              </button>
            </div>
          </div>
        </header>

        {/* --- KPI Summary Matrix --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Gross Revenue", value: "$34,900", icon: DollarSign, trend: "+14.2%", isPositive: true, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { title: "Order Volume", value: "890", icon: Scissors, trend: "+8.4%", isPositive: true, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
            { title: "New Clients", value: "124", icon: Users, trend: "+2.1%", isPositive: true, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
            { title: "Avg. Turnaround", value: "4.2 Days", icon: Calendar, trend: "-0.5 Days", isPositive: true, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-colors shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{stat.title}</span>
                <div className={`p-2 rounded-lg border ${stat.bg} ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <h2 className="text-3xl font-black text-white">
                  {isLoading ? <div className="h-8 w-24 bg-neutral-800 animate-pulse rounded-lg" /> : stat.value}
                </h2>
                {!isLoading && (
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.trend}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* --- Primary Charts Row --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue & Growth Trend (Col Span 2) */}
          <div className="lg:col-span-2 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl p-5 md:p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="text-emerald-400" size={18} /> Revenue Trajectory
                </h3>
                <p className="text-xs text-neutral-500 mt-1">Gross income vs. Order volume over time</p>
              </div>
            </div>
            
            <div className="flex-1 min-h-[300px] w-full">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center text-neutral-600"><Loader2 className="animate-spin" size={24} /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="month" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Garment Popularity (Bar Chart) */}
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl p-5 md:p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Box className="text-indigo-400" size={18} /> Production Distribution
              </h3>
              <p className="text-xs text-neutral-500 mt-1">Most popular garment types</p>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center text-neutral-600"><Loader2 className="animate-spin" size={24} /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={garmentData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#a3a3a3" fontSize={10} tickLine={false} axisLine={false} width={80} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                      {garmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* --- Secondary Data Row (Tables) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Customers Ledger */}
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-neutral-950/30">
              <div className="flex items-center gap-2">
                <Award className="text-amber-400" size={16} />
                <h3 className="text-md font-bold text-white">Top Client Accounts</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-950/60 tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-bold">Client Identity</th>
                    <th className="px-5 py-3 font-bold">Orders</th>
                    <th className="px-5 py-3 font-bold text-right">LTV (Lifetime Value)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-neutral-500"><Loader2 className="animate-spin inline mr-2"/> Compiling data...</td></tr>
                  ) : (
                    topCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{cust.name}</span>
                            <span className="text-[10px] font-mono text-neutral-500">{cust.id} • Last: {cust.lastOrder}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-neutral-300 font-mono">{cust.orders}</td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                            ${cust.spent.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Efficiency Matrix */}
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-neutral-950/30">
              <div className="flex items-center gap-2">
                <Users className="text-cyan-400" size={16} />
                <h3 className="text-md font-bold text-white">Labor Efficiency Matrix</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-950/60 tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-bold">Employee</th>
                    <th className="px-5 py-3 font-bold">Output</th>
                    <th className="px-5 py-3 font-bold text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-neutral-500"><Loader2 className="animate-spin inline mr-2"/> Compiling data...</td></tr>
                  ) : (
                    employeePerformance.map((emp) => (
                      <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{emp.name}</span>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500">{emp.role}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                           <span className="text-neutral-300 font-mono">{emp.itemsCompleted} <span className="font-sans text-[10px] text-neutral-500">garments</span></span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-mono font-bold text-indigo-400">
                            ${emp.revenueGenerated.toLocaleString()}
                          </span>
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
    </div>
  );
}