"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, 
  Printer, Loader2, ArrowUpRight, ArrowDownRight,
  Calculator, PieChart, Banknote
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, Legend
} from "recharts";

interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
}

export default function FinancialReportPage() {
  const [masterData, setMasterData] = useState<any>(null);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const [reportRes, expRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/expenses') // We need expenses to fulfill the "Expense Breakdown" strict requirement
      ]);
      
      const reportJson = await reportRes.json();
      const expJson = await expRes.json();
      
      if (reportJson.success) setMasterData(reportJson.data);
      if (expJson.success) setExpenses(expJson.data);
    } catch (error) {
      console.error("Failed to fetch financial report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Analytics Math ---
  const profitData = [
    { name: 'Income', value: masterData?.finance?.income || 0, color: '#10b981' }, // Emerald
    { name: 'Expenses', value: masterData?.finance?.expenses || 0, color: '#f43f5e' }, // Rose
  ];

  // Group Expenses by Category to fulfill University strict scope "Expense Report"
  const expenseBreakdown = expenses.reduce((acc: any, exp) => {
    const cat = exp.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += Number(exp.amount) || 0;
    return acc;
  }, {});

  const formattedExpenses = Object.keys(expenseBreakdown).map(key => ({
    category: key,
    amount: expenseBreakdown[key]
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

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
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Banknote size={14} /> Fiscal Health & P&L
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Financial Report</h1>
          </div>
          <div className="flex gap-3 no-print">
            <button onClick={() => window.print()} className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
              <Printer size={16} /> Export PDF
            </button>
          </div>
        </header>

        {/* Gradient KPI Cards (Wealth Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Net Profit (Income - Expense)", value: `$${(masterData?.finance?.profit || 0).toLocaleString()}`, icon: <Calculator size={20} className="text-indigo-100" />, bg: "bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-500/30" },
            { title: "Total Lifetime Income", value: `$${(masterData?.finance?.income || 0).toLocaleString()}`, icon: <ArrowUpRight size={20} className="text-emerald-100" />, bg: "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500/30" },
            { title: "Total Lifetime Expenses", value: `$${(masterData?.finance?.expenses || 0).toLocaleString()}`, icon: <ArrowDownRight size={20} className="text-rose-100" />, bg: "bg-gradient-to-br from-rose-500 to-pink-600 border-rose-500/30" },
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

        {/* Debts & Receivables Sub-Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Accounts Receivable</span>
              <p className="text-[10px] text-neutral-500">Money owed to you by customers</p>
            </div>
            <h3 className="text-2xl font-black text-white">${(masterData?.finance?.accountsReceivable || 0).toLocaleString()}</h3>
          </div>
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Accounts Payable</span>
              <p className="text-[10px] text-neutral-500">Money you owe to suppliers</p>
            </div>
            <h3 className="text-2xl font-black text-white">${(masterData?.finance?.accountsPayable || 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Profit vs Loss Bar Chart */}
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-400"/> Income vs Expenses</h3>
            <div className="flex-1 min-h-[300px] w-full">
              {isLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-neutral-500"/></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#999', fontSize: 12}} />
                    <YAxis stroke="#666" tick={{fill: '#999', fontSize: 12}} />
                    <RechartsTooltip cursor={{fill: '#222'}} contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} formatter={(value: any) => `$${Number(value || 0).toLocaleString()}`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {profitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Detailed Expense Breakdown Table (Required Scope) */}
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2"><TrendingDown size={16} className="text-rose-400"/> Operational Expense Breakdown</h3>
             <p className="text-xs text-neutral-500 mb-6">Categorized liability overview.</p>
             
             <div className="overflow-x-auto max-h-[300px] pr-2 no-scrollbar">
               <table className="w-full text-sm text-left">
                 <thead className="text-[10px] text-neutral-500 uppercase border-b border-white/10 sticky top-0 bg-[#0c0c0c] z-10">
                   <tr>
                     <th className="pb-3 font-bold">Category</th>
                     <th className="pb-3 font-bold text-right">Total Spent ($)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {isLoading ? (
                     <tr><td colSpan={2} className="py-8 text-center text-neutral-500"><Loader2 className="animate-spin inline mr-2"/> Auditing ledgers...</td></tr>
                   ) : formattedExpenses.length === 0 ? (
                     <tr><td colSpan={2} className="py-8 text-center text-emerald-500 font-bold">No expenses recorded yet.</td></tr>
                   ) : formattedExpenses.map((exp, idx) => (
                     <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                       <td className="py-4 font-bold text-white">{exp.category}</td>
                       <td className="py-4 text-right">
                         <span className="text-rose-400 font-mono font-bold text-sm">-${exp.amount.toLocaleString()}</span>
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