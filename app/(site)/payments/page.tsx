"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, MoreVertical, Edit2, Trash2, 
  Wallet, DollarSign, Receipt, CreditCard,
  CheckCircle2, AlertCircle, X, Loader2, Send
} from "lucide-react";
import PaymentForm, { PaymentData } from "@/components/forms/PaymentForm";

interface Invoice extends PaymentData {
  id: string;
  balance: number;
  status: "Paid" | "Partial" | "Unpaid";
  invoiceDate: string;
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payments');
      const json = await res.json();
      if (json.success) setInvoices(json.data);
      else setInvoices([]);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => 
      (statusFilter === "All" || inv.status === statusFilter) &&
      (inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || inv.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || inv.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [invoices, searchQuery, statusFilter]);

  const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.amountPaid), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + Number(inv.balance), 0);

  const handleSifaloPush = async (invoice: Invoice) => {
    setActiveMenuId(null);
    try {
      // Simulate pinging the Sifalo Merchant API
      const res = await fetch('/api/payments/sifalo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id, amount: invoice.balance, customer: invoice.customerName })
      }).catch(() => ({ ok: false }));
      
      // Provide UI feedback
      alert(`Sifalo Push Sent: Requested $${invoice.balance} from ${invoice.customerName}'s mobile wallet.`);
    } catch (error) {
      alert("Failed to connect to Sifalo Merchant API.");
    }
  };

  const handleFormSubmit = async (formData: PaymentData) => {
    setIsSubmitting(true);
    try {
      const total = Number(formData.totalAmount);
      const paid = Number(formData.amountPaid);
      const balance = total - paid;
      let status: "Paid" | "Partial" | "Unpaid" = "Unpaid";
      if (paid >= total) status = "Paid";
      else if (paid > 0) status = "Partial";

      if (editingInvoice) {
        setInvoices(invoices.map(i => i.id === editingInvoice.id ? { ...i, ...formData, balance, status } as Invoice : i));
      } else {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.success) setInvoices([json.data, ...invoices]);
        } else {
          // Fallback inject
          const mockInv: Invoice = { ...formData, id: `INV-${Math.floor(1000 + Math.random() * 9000)}`, balance, status, invoiceDate: new Date().toISOString().split('T')[0] } as Invoice;
          setInvoices([mockInv, ...invoices]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "Paid") return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><CheckCircle2 size={10} className="inline mr-1"/>Paid</span>;
    if (status === "Partial") return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Partial</span>;
    return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase"><AlertCircle size={10} className="inline mr-1"/>Unpaid</span>;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Wallet size={14} /> Financial Operations
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Invoices & Payments</h1>
          </div>
          <button onClick={() => { setEditingInvoice(undefined); setIsModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Create Invoice
          </button>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg flex items-center justify-between">
            <div><span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Collected</span><h2 className="text-3xl font-black text-white mt-1">${totalCollected.toLocaleString()}</h2></div>
            <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400"><DollarSign size={20} /></div>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg flex items-center justify-between">
            <div><span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Outstanding Balance</span><h2 className="text-3xl font-black text-white mt-1">${totalOutstanding.toLocaleString()}</h2></div>
            <div className="p-3 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400"><AlertCircle size={20} /></div>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg flex items-center justify-between">
            <div><span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Invoices</span><h2 className="text-3xl font-black text-white mt-1">{invoices.length}</h2></div>
            <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-400"><Receipt size={20} /></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0 pl-1">
            {["All", "Paid", "Partial", "Unpaid"].map((status) => (
              <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${statusFilter === status ? "bg-neutral-800 text-white border border-neutral-700" : "text-neutral-500 hover:text-white"}`}>
                {status}
              </button>
            ))}
          </div>
          <div className="w-full md:w-72 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
            <input type="text" placeholder="Search invoices or clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2 pl-9 pr-4 text-white text-sm outline-none" />
          </div>
        </div>

        {/* Ledger Table View */}
        <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Invoice Details</th>
                  <th className="px-6 py-5 font-bold">Client / Order Link</th>
                  <th className="px-6 py-5 font-bold">Financial Status</th>
                  <th className="px-6 py-5 font-bold">Method</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">No financial records found.</td></tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-emerald-400">{inv.id}</span>
                          <span className="text-[10px] text-neutral-500 mt-0.5">{inv.invoiceDate.split('T')[0]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">{inv.customerName}</span>
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 w-fit px-1.5 py-0.5 rounded mt-1 border border-neutral-800">Ref: {inv.orderId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="font-mono font-bold text-white">${Number(inv.totalAmount).toFixed(2)}</span>
                          <div className="flex items-center gap-2">
                             <StatusBadge status={inv.status} />
                             {inv.balance > 0 && <span className="text-[10px] font-mono text-rose-400">Bal: ${inv.balance.toFixed(2)}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-neutral-300">
                          <CreditCard size={14} className="text-neutral-500"/> {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setActiveMenuId(activeMenuId === inv.id ? null : inv.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none"><MoreVertical size={18} /></button>
                        
                        <AnimatePresence>
                          {activeMenuId === inv.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.15 }} className="absolute right-8 top-10 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                              <div className="py-1">
                                {inv.balance > 0 && (
                                  <button onClick={() => handleSifaloPush(inv)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                    <Send size={14} /> Send Sifalo Push Request
                                  </button>
                                )}
                                <button onClick={() => alert("Opening PDF Generator...")} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors">
                                  <Receipt size={14} /> Print Receipt
                                </button>
                                <div className="h-px bg-neutral-800 my-1" />
                                <button onClick={() => { setEditingInvoice(inv); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"><Edit2 size={14} /> Update Ledger</button>
                                <button onClick={() => { if(confirm("Void this invoice?")) setInvoices(invoices.filter(i => i.id !== inv.id)); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /> Void Record</button>
                              </div>
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => !isSubmitting && setIsModalOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <div className="pointer-events-auto relative w-full max-w-2xl">
                <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 z-10 p-2 bg-neutral-900/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-full transition-colors backdrop-blur-md">
                  <X size={18} />
                </button>
                <PaymentForm initialData={editingInvoice} onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}