"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Loader2 
} from "lucide-react";

interface FinancialRecord {
  id: string;
  amount: number;
  date?: string;
  createdAt?: string;
  description?: string;
}

export default function ProfitReportPage() {
  const [income, setIncome] = useState<FinancialRecord[]>([]);
  const [expenses, setExpenses] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setIsLoading(true);
    try {
      // Fetch both income and expenses simultaneously
      const [incomeRes, expenseRes] = await Promise.all([
        fetch('/api/income'),
        fetch('/api/expenses')
      ]);
      
      const incomeJson = await incomeRes.json();
      const expenseJson = await expenseRes.json();

      if (incomeJson.success) setIncome(incomeJson.data);
      if (expenseJson.success) setExpenses(expenseJson.data);
      
    } catch (error) {
      console.error("Failed to fetch financial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Financial Calculations ---
  const totalIncome = income.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-screen-xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
              <PieChart size={14} /> Financial Analytics
              {isLoading && <Loader2 size={12} className="animate-spin ml-2 text-cyan-500" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Profit & Loss Report
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Real-time calculation of net revenue versus production and operational expenses.
            </p>
          </div>
        </header>

        {/* --- KPI Stats Matrix --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Income Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500 opacity-10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">Total Income</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp size={20} className="text-emerald-400" />
              </div>
            </div>
            <h2 className="text-4xl font-black text-white relative z-10 drop-shadow-md">
              ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          {/* Total Expenses Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-900/40 to-rose-900/10 border border-rose-500/20 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-rose-500 opacity-10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400/80">Total Expenses</span>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <TrendingDown size={20} className="text-rose-400" />
              </div>
            </div>
            <h2 className="text-4xl font-black text-white relative z-10 drop-shadow-md">
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          {/* Net Profit Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-600 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-100/90">Net Profit</span>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <DollarSign size={20} className="text-white" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col">
              <h2 className="text-4xl font-black text-white drop-shadow-md">
                ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className="text-sm font-medium text-cyan-100/70 mt-1">
                Margin: {profitMargin}%
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}