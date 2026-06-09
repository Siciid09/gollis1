"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, MoreVertical, Edit2, Trash2, 
  Search, ShoppingCart, Calendar, DollarSign, 
  Loader2, X, Save, Printer, Layers, FileText,
  PlusCircle, MinusCircle
} from "lucide-react";

// --- Strict Scope Interfaces ---
interface PurchaseItem {
  material: string;
  quantity: number | string;
  unitCost: number | string;
  totalCost: number;
}

interface PurchaseRecord {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  grandTotal: number;
}

interface SupplierOption {
  id: string;
  supplierName: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<PurchaseRecord | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<PurchaseRecord>>({
    purchaseNumber: `PUR-${Math.floor(10000 + Math.random() * 90000)}`,
    supplierName: "",
    date: new Date().toISOString().split('T')[0],
    items: [{ material: "", quantity: "", unitCost: "", totalCost: 0 }],
    grandTotal: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [purRes, supRes] = await Promise.all([
        fetch('/api/purchases'),
        fetch('/api/suppliers')
      ]);
      
      const purJson = await purRes.json();
      const supJson = await supRes.json();
      
      if (purJson.success) setPurchases(purJson.data);
      if (supJson.success) setSuppliers(supJson.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => 
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [purchases, searchQuery]);

  // KPIs
  const totalPurchases = purchases.length;
  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.grandTotal || 0), 0);
  const itemsBought = purchases.reduce((sum, p) => sum + (p.items ? p.items.length : 0), 0);

  // --- Dynamic Items Form Logic ---
  const handleItemChange = (index: number, field: keyof PurchaseItem, value: string) => {
    if (!formData.items) return;
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };
    
    // Auto-calculate total cost for this line item
    const qty = Number(item.quantity) || 0;
    const cost = Number(item.unitCost) || 0;
    item.totalCost = qty * cost;
    
    newItems[index] = item;
    
    // Auto-calculate grand total
    const grandTotal = newItems.reduce((sum, i) => sum + i.totalCost, 0);
    
    setFormData({ ...formData, items: newItems, grandTotal });
  };

  const addItemRow = () => {
    if (!formData.items) return;
    setFormData({ ...formData, items: [...formData.items, { material: "", quantity: "", unitCost: "", totalCost: 0 }] });
  };

  const removeItemRow = (index: number) => {
    if (!formData.items || formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    const grandTotal = newItems.reduce((sum, i) => sum + i.totalCost, 0);
    setFormData({ ...formData, items: newItems, grandTotal });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName) return alert("Please select a supplier.");
    if (!formData.items || formData.items.some(i => !i.material)) return alert("Please fill out all material names.");

    setIsSubmitting(true);
    try {
      const method = activeRecord ? 'PATCH' : 'POST';
      const payload = { ...formData, id: activeRecord?.id };

      const res = await fetch('/api/purchases', {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchData();
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Failed to save purchase:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to permanently delete this purchase record?")) {
      setPurchases(purchases.filter(i => i.id !== id));
      setActiveMenuId(null);
      try {
        await fetch(`/api/purchases?id=${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      {/* Background Glow - Teal Theme */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* --- INJECT PRINT CSS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; background: white; color: black; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold tracking-widest uppercase mb-1">
              <ShoppingCart size={14} /> Procurement Pipeline
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Purchase Management</h1>
          </div>
          <button onClick={() => { 
            setActiveRecord(null); 
            setFormData({ purchaseNumber: `PUR-${Math.floor(10000 + Math.random() * 90000)}`, supplierName: "", date: new Date().toISOString().split('T')[0], items: [{ material: "", quantity: "", unitCost: "", totalCost: 0 }], grandTotal: 0 }); 
            setIsFormOpen(true); 
          }} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Log New Purchase
          </button>
        </header>

        {/* Gradient KPI Cards (Teal/Slate Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Total Procurement Volume", value: totalPurchases.toString(), icon: <Layers size={20} className="text-teal-100" />, bg: "bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-500/30" },
            { title: "Total Capital Spent", value: `$${totalSpent.toLocaleString()}`, icon: <DollarSign size={20} className="text-blue-100" />, bg: "bg-gradient-to-br from-blue-600 to-cyan-500 border-blue-500/30" },
            { title: "Material Lots Acquired", value: itemsBought.toString(), icon: <ShoppingCart size={20} className="text-indigo-100" />, bg: "bg-gradient-to-br from-indigo-600 to-purple-500 border-indigo-500/30" },
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
          <div className="w-full md:w-96 relative group pl-1 py-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-teal-400 transition-colors" size={16} />
            <input type="text" placeholder="Search by supplier or PUR#..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none" />
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Purchase Order</th>
                  <th className="px-6 py-5 font-bold">Supplier Entity</th>
                  <th className="px-6 py-5 font-bold">Date Logged</th>
                  <th className="px-6 py-5 font-bold">Total Valuation</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPurchases.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">No procurement records found.</td></tr>
                ) : (
                  filteredPurchases.map((pur) => (
                    <tr key={pur.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-teal-400">{pur.purchaseNumber}</span>
                          <span className="text-[10px] text-neutral-500 mt-0.5">{pur.items?.length || 0} Materials Logged</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{pur.supplierName}</td>
                      <td className="px-6 py-4 font-mono text-xs text-neutral-300">
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-neutral-500"/> {pur.date}</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">${Number(pur.grandTotal).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setActiveMenuId(activeMenuId === pur.id ? null : pur.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none"><MoreVertical size={18} /></button>
                        <AnimatePresence>
                          {activeMenuId === pur.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-8 top-10 w-44 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                              <button onClick={() => { setActiveRecord(pur); setIsPrintOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-white hover:bg-teal-500/20 transition-colors"><FileText size={14} className="text-teal-400"/> Print Receipt</button>
                              <button onClick={() => { setActiveRecord(pur); setFormData(pur); setIsFormOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"><Edit2 size={14} /> Edit Record</button>
                              <div className="h-px bg-neutral-800 my-1" />
                              <button onClick={() => handleDelete(pur.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /> Delete</button>
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

      {/* --- FORM MODAL (RECORD PURCHASE) --- */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => !isSubmitting && setIsFormOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleSubmit} className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-3xl pointer-events-auto shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white flex items-center gap-2"><ShoppingCart className="text-teal-400" size={20}/> {activeRecord ? "Update Purchase" : "Log New Purchase"}</h2>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-neutral-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">PUR#</label>
                    <input type="text" disabled value={formData.purchaseNumber} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-2.5 px-4 text-neutral-500 font-mono text-sm outline-none cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Date</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-teal-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">Supplier Entity</label>
                    <select required value={formData.supplierName} onChange={(e) => setFormData({...formData, supplierName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-teal-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none">
                      <option value="" disabled>-- Select Supplier --</option>
                      {suppliers.map(s => <option key={s.id} value={s.supplierName}>{s.supplierName}</option>)}
                      <option value="One-Time Vendor">One-Time Vendor</option>
                    </select>
                  </div>
                </div>

                <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950/30">
                  <div className="grid grid-cols-12 gap-2 bg-neutral-950/80 p-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                    <div className="col-span-5">Material Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Unit Cost ($)</div>
                    <div className="col-span-2">Total ($)</div>
                    <div className="col-span-1 text-center">Act</div>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    {formData.items?.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input type="text" required value={item.material} onChange={(e) => handleItemChange(index, "material", e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 focus:border-teal-500 rounded-lg py-2 px-3 text-white text-sm outline-none" placeholder="e.g. Navy Blue Wool" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" min="0" step="0.01" required value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 focus:border-teal-500 rounded-lg py-2 px-3 text-white text-sm outline-none text-center" placeholder="0" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" min="0" step="0.01" required value={item.unitCost} onChange={(e) => handleItemChange(index, "unitCost", e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 focus:border-teal-500 rounded-lg py-2 px-3 text-white text-sm outline-none text-center" placeholder="0.00" />
                        </div>
                        <div className="col-span-2">
                          <input type="text" disabled value={item.totalCost.toFixed(2)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-emerald-400 font-mono font-bold text-sm outline-none text-right cursor-not-allowed" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button type="button" onClick={() => removeItemRow(index)} disabled={formData.items!.length <= 1} className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30"><MinusCircle size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
                    <button type="button" onClick={addItemRow} className="flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"><PlusCircle size={14}/> Add Material Row</button>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Grand Total:</span>
                      <span className="text-xl font-black text-white font-mono">${formData.grandTotal?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-6">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">{isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} {activeRecord ? "Update Record" : "Save Procurement"}</button>
                </div>
              </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* --- PRINT RECEIPT MODAL (Paper View) --- */}
      <AnimatePresence>
        {isPrintOpen && activeRecord && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 no-print" onClick={() => setIsPrintOpen(false)} />
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 pointer-events-none">
              
              <div className="w-full max-w-2xl flex justify-end gap-3 mb-4 pointer-events-auto no-print">
                <button onClick={() => window.print()} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-600/20">
                  <Printer size={16}/> Print Receipt
                </button>
                <button onClick={() => setIsPrintOpen(false)} className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-lg transition-colors">
                  <X size={20}/>
                </button>
              </div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} 
                id="printable-receipt"
                className="bg-white text-black w-full max-w-2xl rounded-sm shadow-2xl p-8 md:p-12 pointer-events-auto overflow-y-auto max-h-[80vh]"
              >
                <div className="flex justify-between items-start border-b-2 border-neutral-200 pb-6 mb-6">
                  <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">PURCHASE RECORD</h1>
                    <p className="text-sm font-bold text-neutral-500 mt-1">{activeRecord.purchaseNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-800">TailorOS Internal Ops</p>
                    <p className="text-xs text-neutral-500 mt-1">Date: {activeRecord.date}</p>
                  </div>
                </div>

                <div className="mb-8 p-4 bg-neutral-100 border border-neutral-300 rounded">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Supplier / Vendor:</h3>
                  <p className="text-lg font-black text-neutral-800">{activeRecord.supplierName}</p>
                </div>

                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b border-neutral-300 text-xs uppercase tracking-wider text-neutral-500 text-left">
                      <th className="pb-3 font-bold">Material</th>
                      <th className="pb-3 font-bold text-center">Qty</th>
                      <th className="pb-3 font-bold text-right">Unit Cost</th>
                      <th className="pb-3 font-bold text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm border-b border-neutral-200">
                    {activeRecord.items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 last:border-0">
                        <td className="py-3 font-medium text-neutral-800">{item.material}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 font-mono text-right">${Number(item.unitCost).toFixed(2)}</td>
                        <td className="py-3 font-mono font-bold text-right">${Number(item.totalCost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-64 border-t-2 border-black pt-3">
                    <div className="flex justify-between text-xl font-black text-neutral-900">
                      <span>Grand Total</span>
                      <span className="font-mono">${Number(activeRecord.grandTotal).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-16 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-500">
                  <p>Official Internal Procurement Record</p>
                  <p className="mt-1">Generated by Smart Tailor Management System</p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}