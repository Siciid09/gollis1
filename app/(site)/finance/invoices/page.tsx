"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, MoreVertical, Edit2, Trash2, 
  Search, FileText, Printer, Download,
  CheckCircle2, AlertCircle, Loader2, X,
  Calculator, Receipt, Building2, Calendar
} from "lucide-react";

// --- Strict Scope Interfaces ---
interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  orderId: string;
  subtotal: number | string;
  tax: number | string; // Optional flat amount or percentage mapped to amount
  discount: number | string;
  grandTotal: number;
  issueDate: string;
  status: "Paid" | "Unpaid" | "Partial";
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceRecord | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (using string | number to prevent TS errors)
  const [formData, setFormData] = useState<Partial<InvoiceRecord>>({
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: "",
    orderId: "",
    subtotal: "",
    tax: "0",
    discount: "0",
    issueDate: new Date().toISOString().split('T')[0],
    status: "Unpaid"
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const json = await res.json();
      if (json.success) setInvoices(json.data);
      else setInvoices([]);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => 
      (statusFilter === "All" || inv.status === statusFilter) &&
      (inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
       inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [invoices, searchQuery, statusFilter]);

  // Dynamic Math for Form
  const currentSubtotal = Number(formData.subtotal) || 0;
  const currentTax = Number(formData.tax) || 0;
  const currentDiscount = Number(formData.discount) || 0;
  const currentGrandTotal = currentSubtotal + currentTax - currentDiscount;

  // KPIs
  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.grandTotal), 0);
  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((sum, inv) => sum + Number(inv.grandTotal), 0);
  const totalUnpaid = invoices.filter(i => i.status !== "Paid").reduce((sum, inv) => sum + Number(inv.grandTotal), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = activeInvoice && isFormOpen ? `/api/invoices/${activeInvoice.id}` : '/api/invoices';
      const method = activeInvoice && isFormOpen ? 'PATCH' : 'POST';
      
      const payload = { 
        ...formData, 
        subtotal: Number(formData.subtotal),
        tax: Number(formData.tax),
        discount: Number(formData.discount),
        grandTotal: currentGrandTotal
      };
      
      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchInvoices();
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Failed to save invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to permanently delete this invoice?")) {
      setInvoices(invoices.filter(i => i.id !== id));
      setActiveMenuId(null);
      try {
        await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      {/* Background Glow - Violet Theme */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* --- INJECT PRINT CSS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; background: white; color: black; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold tracking-widest uppercase mb-1">
              <FileText size={14} /> Billing & Documentation
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Invoice Management</h1>
          </div>
          <button onClick={() => { 
            setActiveInvoice(null); 
            setFormData({ invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`, customerName: "", orderId: "", subtotal: "", tax: "0", discount: "0", issueDate: new Date().toISOString().split('T')[0], status: "Unpaid" }); 
            setIsFormOpen(true); 
          }} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Generate Invoice
          </button>
        </header>

        {/* Gradient KPI Cards (Violet Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Total Invoiced Volume", value: `$${totalInvoiced.toLocaleString()}`, icon: <Calculator size={20} className="text-violet-100" />, bg: "bg-gradient-to-br from-violet-600 to-purple-600 border-violet-500/30" },
            { title: "Collected Revenue (Paid)", value: `$${totalPaid.toLocaleString()}`, icon: <CheckCircle2 size={20} className="text-emerald-100" />, bg: "bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-500/30" },
            { title: "Outstanding Receivables", value: `$${totalUnpaid.toLocaleString()}`, icon: <AlertCircle size={20} className="text-rose-100" />, bg: "bg-gradient-to-br from-rose-500 to-pink-500 border-rose-500/30" },
          ].map((card, i) => (
            <div key={i} className={`p-6 rounded-2xl ${card.bg} border shadow-xl relative overflow-hidden transition-all hover:scale-[1.02]`}>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 drop-shadow-sm">{card.title}</span>
                <div className="p-2 bg-black/20 rounded-lg backdrop-blur-md">{card.icon}</div>
              </div>
              <h2 className="text-4xl font-black text-white relative z-10 drop-shadow-md">
                {isLoading ? <div className="h-10 w-24 bg-white/20 animate-pulse rounded-md" /> : card.value}
              </h2>
            </div>
          ))}
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
          <div className="w-full md:w-72 relative group pr-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-violet-400 transition-colors" size={16} />
            <input type="text" placeholder="Search customer or INV#..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-2 pl-9 pr-4 text-white text-sm outline-none" />
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Invoice Details</th>
                  <th className="px-6 py-5 font-bold">Customer & Order</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                  <th className="px-6 py-5 font-bold">Grand Total</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">No invoices found.</td></tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-violet-400">{inv.invoiceNumber}</span>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5">{inv.issueDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{inv.customerName}</span>
                          <span className="text-[10px] text-neutral-500 mt-0.5">Order Ref: {inv.orderId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          inv.status === "Partial" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>{inv.status}</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-white">${Number(inv.grandTotal).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setActiveMenuId(activeMenuId === inv.id ? null : inv.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none"><MoreVertical size={18} /></button>
                        <AnimatePresence>
                          {activeMenuId === inv.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-8 top-10 w-44 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                              <button onClick={() => { setActiveInvoice(inv); setIsViewOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-white hover:bg-violet-500/20 transition-colors"><FileText size={14} className="text-violet-400"/> View / Print PDF</button>
                              <button onClick={() => { setFormData(inv); setActiveInvoice(inv); setIsFormOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"><Edit2 size={14} /> Edit Invoice</button>
                              <div className="h-px bg-neutral-800 my-1" />
                              <button onClick={() => handleDelete(inv.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /> Delete</button>
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

      {/* --- FORM MODAL (GENERATE INVOICE) --- */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => !isSubmitting && setIsFormOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleSubmit} className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl pointer-events-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white">{activeInvoice ? "Update Invoice" : "Generate Invoice"}</h2>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-neutral-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Identifiers */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Invoice Number</label>
                    <input type="text" required value={formData.invoiceNumber} onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 rounded-xl py-3 px-4 text-white text-sm outline-none font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Issue Date</label>
                    <input type="date" required value={formData.issueDate} onChange={(e) => setFormData({...formData, issueDate: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 rounded-xl py-3 px-4 text-white text-sm outline-none" />
                  </div>
                  
                  {/* Relations */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Customer Name</label>
                    <input type="text" required value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 rounded-xl py-3 px-4 text-white text-sm outline-none" placeholder="e.g. Ali Ahmed" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Order ID / Ref</label>
                    <input type="text" required value={formData.orderId} onChange={(e) => setFormData({...formData, orderId: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 rounded-xl py-3 px-4 text-white text-sm outline-none font-mono" placeholder="e.g. ORD-1234" />
                  </div>

                  {/* Financial Math */}
                  <div className="md:col-span-2 grid grid-cols-3 gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-950/50 mt-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Subtotal ($)</label>
                      <input type="number" required min="0" step="0.01" value={formData.subtotal} onChange={(e) => setFormData({...formData, subtotal: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 rounded-xl py-2 px-3 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Tax ($) <span className="text-neutral-600 font-normal">Optional</span></label>
                      <input type="number" min="0" step="0.01" value={formData.tax} onChange={(e) => setFormData({...formData, tax: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 rounded-xl py-2 px-3 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Discount ($)</label>
                      <input type="number" min="0" step="0.01" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 rounded-xl py-2 px-3 text-white text-sm outline-none" />
                    </div>
                  </div>

                  {/* Status & Final Math */}
                  <div className="flex items-center justify-between md:col-span-2 mt-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Payment Status</label>
                      <select required value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="bg-neutral-950 border border-neutral-800 focus:border-violet-500 rounded-xl py-2 px-4 text-white text-sm outline-none">
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Grand Total</span>
                      <h3 className="text-3xl font-black text-violet-400">${currentGrandTotal.toFixed(2)}</h3>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-6">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">{isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>} Save Invoice</button>
                </div>
              </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* --- PRINT / PDF VIEW MODAL (Looks like paper!) --- */}
      <AnimatePresence>
        {isViewOpen && activeInvoice && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 no-print" onClick={() => setIsViewOpen(false)} />
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 pointer-events-none">
              
              {/* Toolbar above the paper */}
              <div className="w-full max-w-2xl flex justify-end gap-3 mb-4 pointer-events-auto no-print">
                <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                  <Printer size={16}/> Print / Save PDF
                </button>
                <button onClick={() => setIsViewOpen(false)} className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-lg transition-colors">
                  <X size={20}/>
                </button>
              </div>

              {/* The Paper Document */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} 
                id="printable-invoice"
                className="bg-white text-black w-full max-w-2xl rounded-sm shadow-2xl p-8 md:p-12 pointer-events-auto overflow-y-auto max-h-[80vh]"
              >
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-neutral-200 pb-6 mb-6">
                  <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">INVOICE</h1>
                    <p className="text-sm font-bold text-neutral-500 mt-1">{activeInvoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-indigo-600 font-bold mb-1">
                      <Building2 size={18} /> TailorOS Workshop
                    </div>
                    <p className="text-xs text-neutral-500">123 Fashion Avenue<br/>Hargeisa, Somalia<br/>finance@tailoros.com</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Bill To:</h3>
                    <p className="text-base font-bold text-neutral-800">{activeInvoice.customerName}</p>
                    <p className="text-sm text-neutral-600 mt-1">Order Ref: <span className="font-mono bg-neutral-100 px-1 py-0.5 rounded">{activeInvoice.orderId}</span></p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Issue Date:</h3>
                      <p className="text-sm font-bold text-neutral-800">{activeInvoice.issueDate}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Payment Status:</h3>
                      <p className={`text-sm font-bold uppercase ${activeInvoice.status === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}`}>{activeInvoice.status}</p>
                    </div>
                  </div>
                </div>

                {/* Line Items Table (Simplified for scope) */}
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b border-neutral-300 text-xs uppercase tracking-wider text-neutral-500 text-left">
                      <th className="pb-3 font-bold">Description</th>
                      <th className="pb-3 font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm border-b border-neutral-200">
                    <tr>
                      <td className="py-4 font-medium text-neutral-800">Custom Tailoring Services (Ref: {activeInvoice.orderId})</td>
                      <td className="py-4 font-mono font-bold text-right">${Number(activeInvoice.subtotal).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals Math */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>Subtotal</span>
                      <span className="font-mono">${Number(activeInvoice.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>Tax (Optional)</span>
                      <span className="font-mono">+ ${Number(activeInvoice.tax).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-rose-600">
                      <span>Discount</span>
                      <span className="font-mono">- ${Number(activeInvoice.discount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-neutral-900 border-t-2 border-neutral-900 pt-3 mt-3">
                      <span>Grand Total</span>
                      <span className="font-mono">${Number(activeInvoice.grandTotal).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-16 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-500">
                  <p>Thank you for choosing our bespoke services.</p>
                  <p className="mt-1">All payments should be made via Cash, EVC Plus, or Zaad based on standard shop protocol.</p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}