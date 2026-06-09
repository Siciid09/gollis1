"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, MoreVertical, Edit2, Trash2, 
  Search, Truck, Phone, Mail, MapPin, 
  Loader2, X, Save, DollarSign, Building2,
  AlertCircle
} from "lucide-react";

// --- Strict Scope Interfaces ---
interface SupplierRecord {
  id: string;
  supplierName: string;
  phone: string;
  email: string;
  address: string;
  outstandingBalance: number | string;
  notes?: string;
  createdAt?: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<SupplierRecord | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<SupplierRecord>>({
    supplierName: "", phone: "", email: "", address: "", outstandingBalance: "0", notes: ""
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/suppliers');
      const json = await res.json();
      if (json.success) setSuppliers(json.data);
      else setSuppliers([]);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
    );
  }, [suppliers, searchQuery]);

  // KPIs
  const totalSuppliers = suppliers.length;
  const totalOutstanding = suppliers.reduce((sum, s) => sum + Number(s.outstandingBalance || 0), 0);
  const suppliersOwed = suppliers.filter(s => Number(s.outstandingBalance) > 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = activeRecord ? 'PATCH' : 'POST';
      const payload = { 
        ...formData, 
        outstandingBalance: Number(formData.outstandingBalance),
        id: activeRecord?.id 
      };

      const res = await fetch('/api/suppliers', {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchSuppliers();
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Failed to save supplier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this supplier profile?")) {
      setSuppliers(suppliers.filter(i => i.id !== id));
      setActiveMenuId(null);
      try {
        await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      {/* Background Glow - Cyan Theme */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Truck size={14} /> Supply Chain Matrix
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Supplier Management</h1>
          </div>
          <button onClick={() => { 
            setActiveRecord(null); 
            setFormData({ supplierName: "", phone: "", email: "", address: "", outstandingBalance: "0", notes: "" }); 
            setIsFormOpen(true); 
          }} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Register Supplier
          </button>
        </header>

        {/* Gradient KPI Cards (Cyan/Blue Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Total Registered Suppliers", value: totalSuppliers.toString(), icon: <Building2 size={20} className="text-cyan-100" />, bg: "bg-gradient-to-br from-cyan-600 to-blue-500 border-cyan-500/30" },
            { title: "Accounts Payable (Debt)", value: `$${totalOutstanding.toLocaleString()}`, icon: <DollarSign size={20} className="text-rose-100" />, bg: "bg-gradient-to-br from-rose-600 to-pink-500 border-rose-500/30" },
            { title: "Suppliers Owed", value: suppliersOwed.toString(), icon: <AlertCircle size={20} className="text-amber-100" />, bg: "bg-gradient-to-br from-amber-500 to-orange-500 border-amber-500/30" },
          ].map((card, i) => (
            <div key={i} className={`p-6 rounded-2xl ${card.bg} border shadow-xl relative overflow-hidden transition-all hover:scale-[1.02]`}>
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

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="w-full md:w-96 relative group pl-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
            <input type="text" placeholder="Search suppliers by name or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none" />
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Supplier Entity</th>
                  <th className="px-6 py-5 font-bold">Contact Vectors</th>
                  <th className="px-6 py-5 font-bold">Location</th>
                  <th className="px-6 py-5 font-bold">Outstanding Balance</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSuppliers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">No suppliers match your query.</td></tr>
                ) : (
                  filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                            {sup.supplierName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">{sup.supplierName}</span>
                            <span className="text-[10px] font-mono text-neutral-500 mt-0.5">ID: {sup.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-xs text-neutral-300"><Phone size={12} className="text-neutral-500"/> {sup.phone}</span>
                          {sup.email && <span className="flex items-center gap-1.5 text-[10px] text-neutral-500"><Mail size={12} /> {sup.email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-neutral-300 truncate max-w-[200px]" title={sup.address}>
                          <MapPin size={12} className="text-neutral-500 shrink-0"/> {sup.address || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono font-bold ${Number(sup.outstandingBalance) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ${Number(sup.outstandingBalance).toFixed(2)}
                        </span>
                        {Number(sup.outstandingBalance) > 0 && <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded ml-2 uppercase font-bold border border-rose-500/20">Owed</span>}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setActiveMenuId(activeMenuId === sup.id ? null : sup.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none"><MoreVertical size={18} /></button>
                        <AnimatePresence>
                          {activeMenuId === sup.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-8 top-10 w-44 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                              <button onClick={() => { setActiveRecord(sup); setFormData(sup); setIsFormOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"><Edit2 size={14} /> Update Profile</button>
                              <div className="h-px bg-neutral-800 my-1" />
                              <button onClick={() => handleDelete(sup.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /> Delete Record</button>
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

      {/* --- FORM MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => !isSubmitting && setIsFormOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleSubmit} className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl pointer-events-auto shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white flex items-center gap-2"><Truck className="text-cyan-400" size={20}/> {activeRecord ? "Update Supplier" : "Register Supplier"}</h2>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-neutral-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Entity / Business Name</label>
                    <input type="text" required value={formData.supplierName} onChange={(e) => setFormData({...formData, supplierName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl py-3 px-4 text-white text-sm outline-none" placeholder="e.g. Hargeisa Textiles Ltd." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Phone Vector</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl py-3 px-4 text-white text-sm outline-none" placeholder="+252..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Email (Optional)</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl py-3 px-4 text-white text-sm outline-none" placeholder="contact@supplier.com" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Physical Address</label>
                    <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl py-3 px-4 text-white text-sm outline-none" placeholder="e.g. 123 Market Street" />
                  </div>
                  <div className="md:col-span-2 p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl mt-2">
                    <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Outstanding Balance / Debt ($)</label>
                    <input type="number" min="0" step="0.01" value={formData.outstandingBalance} onChange={(e) => setFormData({...formData, outstandingBalance: e.target.value})} className="w-full bg-neutral-950 border border-rose-500/30 focus:border-rose-500 rounded-xl py-3 px-4 text-white text-sm outline-none" placeholder="0.00" />
                    <p className="text-[10px] text-neutral-500 mt-1">If you owe this supplier money for previous materials, enter the balance here.</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-6">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">{isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save Supplier</button>
                </div>
              </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}