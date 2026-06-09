"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, MoreVertical, Edit2, Trash2, 
  Search, TrendingDown, Filter, X, 
  Loader2, ArrowDownRight, Tag, Calendar,
  Save
} from "lucide-react";

// --- Strict Scope Interfaces ---
type ExpenseCategory = "Rent" | "Electricity" | "Water" | "Internet" | "Salaries" | "Transport" | "Maintenance" | "Miscellaneous";

interface ExpenseRecord {
  id: string;
  expenseName: string;
  amount: number | string;
  date: string;
  category: ExpenseCategory;
  notes: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = ["Rent", "Electricity", "Water", "Internet", "Salaries", "Transport", "Maintenance", "Miscellaneous"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "All">("All");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ExpenseRecord>>({
    expenseName: "", category: "Miscellaneous", amount: "", date: new Date().toISOString().split('T')[0], notes: ""
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/expenses');
      const json = await res.json();
      if (json.success) setExpenses(json.data);
      else setExpenses([]);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => 
      (categoryFilter === "All" || exp.category === categoryFilter) &&
      (exp.expenseName.toLowerCase().includes(searchQuery.toLowerCase()) || exp.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [expenses, searchQuery, categoryFilter]);

  // KPIs
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const salariesTotal = expenses.filter(e => e.category === "Salaries").reduce((sum, exp) => sum + Number(exp.amount), 0);
  const utilitiesTotal = expenses.filter(e => ["Electricity", "Water", "Internet"].includes(e.category)).reduce((sum, exp) => sum + Number(exp.amount), 0);
  const thisMonthTotal = expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).reduce((sum, exp) => sum + Number(exp.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = editingRecord ? `/api/expenses/${editingRecord.id}` : '/api/expenses';
      const method = editingRecord ? 'PATCH' : 'POST';
      
      const payload = { ...formData, amount: Number(formData.amount) };
      
      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchExpenses();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to save record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this expense record?")) {
      setExpenses(expenses.filter(i => i.id !== id));
      setActiveMenuId(null);
      try {
        await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold tracking-widest uppercase mb-1">
              <TrendingDown size={14} /> Liability Tracking
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Expense Management</h1>
          </div>
          <button onClick={() => { setEditingRecord(null); setFormData({ expenseName: "", category: "Miscellaneous", amount: "", date: new Date().toISOString().split('T')[0], notes: "" }); setIsModalOpen(true); }} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Log Expense
          </button>
        </header>

        {/* Gradient KPI Cards (Rose/Red Theme) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Lifetime Expenses", value: `$${totalExpenses.toLocaleString()}`, icon: <ArrowDownRight size={20} className="text-rose-100" />, bg: "bg-gradient-to-br from-rose-600 to-pink-500 border-rose-500/30" },
            { title: "Total This Month", value: `$${thisMonthTotal.toLocaleString()}`, icon: <Calendar size={20} className="text-orange-100" />, bg: "bg-gradient-to-br from-orange-500 to-red-500 border-orange-500/30" },
            { title: "Total Payroll (Salaries)", value: `$${salariesTotal.toLocaleString()}`, icon: <TrendingDown size={20} className="text-amber-100" />, bg: "bg-gradient-to-br from-amber-600 to-orange-500 border-amber-500/30" },
            { title: "Utilities (Water/Elec/Net)", value: `$${utilitiesTotal.toLocaleString()}`, icon: <Tag size={20} className="text-red-100" />, bg: "bg-gradient-to-br from-red-600 to-rose-700 border-red-500/30" },
          ].map((card, i) => (
            <div key={i} className={`p-5 rounded-2xl ${card.bg} border shadow-lg relative overflow-hidden transition-transform hover:-translate-y-1`}>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 drop-shadow-sm">{card.title}</span>
                <div className="p-2 bg-black/20 rounded-lg backdrop-blur-md">{card.icon}</div>
              </div>
              <h2 className="text-3xl font-black text-white relative z-10 drop-shadow-md">
                {isLoading ? <div className="h-8 w-16 bg-white/20 animate-pulse rounded-md" /> : card.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0 pl-1">
            {["All", ...EXPENSE_CATEGORIES].map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat as any)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${categoryFilter === cat ? "bg-neutral-800 text-white border border-neutral-700" : "text-neutral-500 hover:text-white"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="w-full md:w-72 relative group pr-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-400 transition-colors" size={16} />
            <input type="text" placeholder="Search expenses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-2 pl-9 pr-4 text-white text-sm outline-none" />
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Date</th>
                  <th className="px-6 py-5 font-bold">Expense Title & Notes</th>
                  <th className="px-6 py-5 font-bold">Category</th>
                  <th className="px-6 py-5 font-bold">Amount</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredExpenses.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">No expense records found.</td></tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-mono text-neutral-300 text-xs">{exp.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{exp.expenseName}</span>
                          <span className="text-[10px] text-neutral-500 mt-0.5 truncate max-w-[200px]">{exp.notes || "No notes"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-neutral-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-rose-400">-${Number(exp.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setActiveMenuId(activeMenuId === exp.id ? null : exp.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none"><MoreVertical size={18} /></button>
                        <AnimatePresence>
                          {activeMenuId === exp.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-8 top-10 w-40 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                              <button onClick={() => { setEditingRecord(exp); setFormData(exp); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"><Edit2 size={14} /> Edit</button>
                              <div className="h-px bg-neutral-800 my-1" />
                              <button onClick={() => handleDelete(exp.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /> Delete</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inline Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => !isSubmitting && setIsModalOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleSubmit} className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg pointer-events-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white">{editingRecord ? "Update Expense" : "Log New Expense"}</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Expense Name</label>
                    <input type="text" required value={formData.expenseName} onChange={(e) => setFormData({...formData, expenseName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-xl py-3 px-4 text-white text-sm outline-none" placeholder="e.g. May Shop Rent" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Category</label>
                      <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as ExpenseCategory})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-xl py-3 px-4 text-white text-sm outline-none">
                        {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-rose-500 uppercase tracking-wider block mb-1">Amount ($)</label>
                      <input type="number" required min="0" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-neutral-950 border border-rose-500/30 focus:border-rose-500 rounded-xl py-3 px-4 text-white text-sm outline-none" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Date</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-xl py-3 px-4 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Notes</label>
                    <input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-xl py-3 px-4 text-white text-sm outline-none" placeholder="Optional details..." />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">{isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save Record</button>
                </div>
              </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}