"use client";

import React, { useState } from "react";
import { 
  Users, 
  Scissors, 
  DollarSign, 
  PackageCheck, 
  TrendingUp,
  Clock, 
  AlertTriangle, 
  Shirt, 
  QrCode, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function SuperDashboard() {
  // Mock states to make the dashboard dynamic and interactive during your defense presentation
  const [selectedOrder, setSelectedOrder] = useState<string | null>("#ORD-9021");

  // Analytics KPIs based exactly on your requirements
  const stats = [
    { title: "Total Customers", value: "1,248", icon: Users, trend: "+12% this month", color: "from-blue-500/20 to-indigo-500/20 text-indigo-400" },
    { title: "Active Production", value: "42", icon: Scissors, trend: "8 due today", color: "from-amber-500/20 to-orange-500/20 text-amber-400" },
    { title: "Monthly Revenue", value: "$8,450", icon: DollarSign, trend: "+5% vs last month", color: "from-emerald-500/20 to-teal-500/20 text-emerald-400" },
    { title: "Pending Payments", value: "$1,820", icon: Clock, trend: "Requires attention", color: "from-rose-500/20 to-red-500/20 text-rose-400" },
  ];

  // Production Stages for tracking (Matches your Step 7: Production Tracking perfectly)
  const productionStages = [
    { label: "Created", current: true, complete: true },
    { label: "Measured", current: true, complete: true },
    { label: "Cutting", current: true, complete: true },
    { label: "Sewing", current: false, complete: false },
    { label: "Fitting", current: false, complete: false },
    { label: "Ready", current: false, complete: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 text-neutral-200">
      
      {/* 1. Header with System Context & High-Grade Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/40 via-neutral-900/50 to-neutral-900/20 p-6 rounded-2xl border border-indigo-500/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-1">
            <Sparkles size={14} /> TailorOS Core Engine
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Enterprise Dashboard
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Operational center executing multi-item workflows, measurement indexing, and payment balancing.
          </p>
        </div>
        
        {/* Defense panel quick demo buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Database Connected
          </div>
          <button className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 px-4 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center gap-2">
            <Plus size={14} /> New Customer
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2">
            <Scissors size={14} /> Create Order
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Stats Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="p-6 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 shadow-sm hover:border-neutral-700/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                {stat.value}
              </h2>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs font-medium text-neutral-400">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">{stat.trend.split(" ")[0]}</span>
              <span>{stat.trend.substring(stat.trend.indexOf(" "))}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Operational Workstation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Core Active Production & Sub-Collection System */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Production Pipeline Monitor */}
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="text-indigo-400" size={18} />
                <h3 className="text-lg font-bold text-white">Live Production Tracker</h3>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-mono">
                Selected: {selectedOrder}
              </span>
            </div>

            {/* Dynamic Step visualizer matching your exact module structure */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 relative">
              {productionStages.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-3 rounded-xl bg-neutral-950/40 border border-neutral-900 relative">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                    stage.complete 
                      ? "bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/20" 
                      : idx === 3 
                        ? "bg-indigo-600 text-white animate-pulse" 
                        : "bg-neutral-800 text-neutral-500"
                  }`}>
                    {stage.complete ? <CheckCircle2 size={14} /> : idx + 1}
                  </div>
                  <span className={`text-xs font-medium ${stage.complete ? "text-neutral-300" : idx === 3 ? "text-indigo-400 font-bold" : "text-neutral-500"}`}>
                    {stage.label}
                  </span>
                  {idx < 5 && (
                    <ChevronRight className="absolute -right-2.5 top-5 text-neutral-800 hidden sm:block" size={16} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Orders Sub-Collection Table */}
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Active Queue & Relational Matrix</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Demonstrating one-to-many schema logic using embedded `customerId` pointers.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order Pointer</th>
                    <th className="px-6 py-4 font-medium">Customer Matrix</th>
                    <th className="px-6 py-4 font-medium">Garment Subtype</th>
                    <th className="px-6 py-4 font-medium">Operational Status</th>
                    <th className="px-6 py-4 font-medium">Financial Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {/* Row 1 */}
                  <tr 
                    onClick={() => setSelectedOrder("#ORD-9021")}
                    className={`cursor-pointer transition-colors ${selectedOrder === "#ORD-9021" ? "bg-indigo-600/5 text-white" : "hover:bg-neutral-800/30 text-neutral-300"}`}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">#ORD-9021</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">Ahmed Ali</span>
                        <span className="text-[11px] text-neutral-500">ID: cust-4560</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">3-Piece Italian Suit</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Sewing Engine
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-amber-400 font-semibold">$150 Remaining</span>
                        <span className="text-[11px] text-neutral-500">Deposit: $200</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Row 2 */}
                  <tr 
                    onClick={() => setSelectedOrder("#ORD-9022")}
                    className={`cursor-pointer transition-colors ${selectedOrder === "#ORD-9022" ? "bg-indigo-600/5 text-white" : "hover:bg-neutral-800/30 text-neutral-300"}`}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">#ORD-9022</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">Sarah Mohamed</span>
                        <span className="text-[11px] text-neutral-500">ID: cust-7812</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">Traditional Dirac Dress</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Ready for Pickup
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                        Paid Full
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Defense Presentation Proofs & Real-Time Modules */}
        <div className="space-y-6">
          
          {/* Defense Highlight 1: Instant Scan & Verification Module */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-transform pointer-events-none">
              <QrCode size={120} className="text-white" />
            </div>
            
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
              <QrCode size={14} /> Graduation Defense Showcase
            </div>
            <h4 className="text-md font-bold text-white mb-2">Instant Receipt Scanner</h4>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Demonstrates automatic relational loading via receipt scanning parameters to speed up pick-ups.
            </p>
            
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg">
                  <QrCode size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold text-white">SCANNER_READY</span>
                  <span className="text-[10px] text-neutral-500">Awaiting hardware vector/camera input</span>
                </div>
              </div>
              <button 
                onClick={() => alert("Simulating QR Scan: Order #ORD-9021 instantly fetched from relational database.")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] px-3 py-2 rounded-lg transition-all active:scale-95"
              >
                Mock Scan
              </button>
            </div>
          </div>

          {/* Defense Highlight 2: CRM & Notification Engine */}
          <div className="rounded-2xl p-6 bg-neutral-900/40 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-emerald-400" size={18} />
              <h4 className="text-md font-bold text-white">One-Click Dispatch Engine</h4>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Automates client update messaging natively through localized string parameters to eliminate structural calling gaps.
            </p>
            
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-900 flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="font-bold text-neutral-200">Ahmed Ali (Suit)</span>
                  <span className="text-[10px] text-neutral-500">Status updated: Sewing</span>
                </div>
                <a 
                  href={`https://wa.me/252634000000?text=Hello Ahmed, your 3-Piece Italian Suit order (#ORD-9021) has progressed to the Sewing stage at our workshop.`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 rounded-lg border border-transparent hover:border-neutral-700 transition-colors"
                >
                  <ArrowUpRight size={16} />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-900 flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="font-bold text-neutral-200">Sarah Mohamed (Dress)</span>
                  <span className="text-[10px] text-neutral-400 text-emerald-400 font-semibold">Ready for Pickup</span>
                </div>
                <a 
                  href={`https://wa.me/252634000000?text=Hello Sarah, your Traditional Dirac Dress order (#ORD-9022) is fully completed and ready for pickup!`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 rounded-lg border border-transparent hover:border-neutral-700 transition-colors"
                >
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Defense Highlight 3: Inventory Sub-System Integration */}
          <div className="rounded-2xl p-6 bg-neutral-900/40 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shirt className="text-indigo-400" size={18} />
                <h4 className="text-md font-bold text-white">Material Supply Vectors</h4>
              </div>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                <AlertTriangle size={10} /> 2 Alerts
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300">Premium Cashmere Wool</span>
                  <span className="text-neutral-400 font-mono">14 meters remaining</span>
                </div>
                <div className="w-full bg-neutral-950 rounded-full h-1.5 border border-neutral-900">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300">Royal Navy Cotton Blend</span>
                  <span className="text-rose-400 font-bold font-mono">2 meters remaining</span>
                </div>
                <div className="w-full bg-neutral-950 rounded-full h-1.5 border border-neutral-900">
                  <div className="bg-rose-500 h-1.5 rounded-full animate-pulse" style={{ width: "12%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Distribution Index */}
          <div className="rounded-2xl p-4 bg-neutral-950/40 border border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UserCheck size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Staff Allocation Matrix</span>
                <span className="text-[10px] text-neutral-500">5 Cutters | 12 Tailors Active</span>
              </div>
            </div>
            <span className="text-xs font-mono bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg text-neutral-400">
              v1.0.4-Stable
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}