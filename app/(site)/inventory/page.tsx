"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from 'qrcode.react';
import { 
  Search, Plus, MoreVertical, Edit2, Trash2, 
  Box, AlertTriangle, Layers, TrendingDown,
  Minus, Filter, X, Zap, Loader2, Palette,
  DollarSign, History, ArrowRightCircle,
  UserCircle2, QrCode, Printer
} from "lucide-react";
import InventoryForm, { InventoryItemData } from "./../../../components/forms/InventoryForm"; // Adjust import path if needed

// --- TypeScript Interfaces ---
export type CategoryType = "Fabric" | "Thread" | "Accessories" | "Hardware";

interface InventoryLog {
  id: string;
  type: "IN" | "OUT";
  amount: number;
  previousStock: number;
  newStock: number;
  date: string;
  user: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: CategoryType;
  quantity: number | string;
  unit: string;
  alertThreshold: number | string;
  color?: string;
  cost?: number; 
  logs?: InventoryLog[]; 
}

export default function InventoryPage() {
  // --- State Management ---
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryType | "All">("All");
  
  // Modal & Actions State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<InventoryItem | null>(null);
  
  // NEW: State for the QR Code Generator Modal
  const [qrModalItem, setQrModalItem] = useState<InventoryItem | null>(null);

  // NEW: Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemData | undefined>(undefined);

  // --- Dynamic Database Fetching ---
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory/adjust');
      const json = await res.json();
      
      if (json.success) {
        setInventory(json.data);
      } else {
        setInventory([]);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Derived State & Logic ---
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      (activeCategory === "All" || item.category === activeCategory) &&
      (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.id && item.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [inventory, searchQuery, activeCategory]);

  const lowStockItems = inventory.filter(i => Number(i.quantity) <= Number(i.alertThreshold) && Number(i.quantity) > 0);
  const criticalStockItems = inventory.filter(i => Number(i.quantity) === 0);
  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.cost || 0)), 0);

  // --- Handlers ---
  const handleQuickAdjust = async (id: string, amount: number) => {
    // 1. Optimistic UI Update (Instant change on screen)
    setInventory(currentInv => currentInv.map(item => {
      if (item.id === id) {
        const prev = Number(item.quantity);
        const newQuantity = Math.max(0, prev + amount);
        
        const newLog: InventoryLog = {
          id: `LOG-${Math.floor(Math.random() * 90000)}`,
          type: amount > 0 ? "IN" : "OUT",
          amount: Math.abs(amount),
          previousStock: prev,
          newStock: newQuantity,
          date: new Date().toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          user: "Mubarik (Admin)"
        };

        return { ...item, quantity: newQuantity, logs: [newLog, ...(item.logs || [])] };
      }
      return item;
    }));

    // 2. Real Database Update via the route we created earlier
    try {
      await fetch('/api/inventory/adjust', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, amount })
      });
    } catch (error) {
      console.error("Failed to adjust stock in DB:", error);
    }
  };

  const handleOpenHistory = (item: InventoryItem) => {
    setSelectedHistoryItem(item);
    setActiveMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to remove this item from the warehouse matrix?")) {
      // 1. Hide from screen instantly
      setInventory(inventory.filter(i => i.id !== id));
      setActiveMenuId(null);
      
      // 2. Erase from Firebase permanently
      try {
        await fetch(`/api/inventory/adjust${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error("Failed to delete item from DB", error);
      }
    }
  };

  // NEW: Print Handler for the QR Label
  const handlePrintQR = () => {
    if (!qrModalItem) return;
    
    // Open a temporary print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Grab the raw SVG HTML from the DOM container
      const svgElement = document.getElementById('qr-svg-container')?.innerHTML || '';
      
      // Inject purely black and white printable HTML
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Label - ${qrModalItem.id}</title>
            <style>
              body { 
                font-family: system-ui, sans-serif; 
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                margin: 0; padding: 20px;
              }
              .label { 
                border: 2px dashed #000; padding: 24px; text-align: center; 
                width: 250px; border-radius: 8px;
              }
              h1 { margin: 0 0 16px 0; font-size: 18px; font-weight: 900; text-transform: uppercase; }
              p { margin: 6px 0 0 0; font-size: 14px; font-weight: bold; font-family: monospace; }
              .meta { font-size: 11px; font-weight: normal; margin-top: 4px; color: #333; }
            </style>
          </head>
          <body>
            <div class="label">
              <h1>${qrModalItem.name}</h1>
              ${svgElement}
              <p>SKU: ${qrModalItem.id}</p>
              <div class="meta">${qrModalItem.category} • ${qrModalItem.color || 'Standard'}</div>
            </div>
            <script>
              // Wait a fraction of a second for the SVG to render, then trigger print
              setTimeout(() => { window.print(); window.close(); }, 250);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // --- Utility Components ---
  const CategoryBadge = ({ category }: { category: CategoryType }) => {
    const styles = {
      Fabric: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      Thread: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      Accessories: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Hardware: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[category] || styles.Fabric}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Box size={14} /> Warehouse Logistics
              {isLoading && <Loader2 size={12} className="animate-spin text-cyan-400 ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Inventory Matrix
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Live stock vectors, cost evaluations, and automated audit trails.
            </p>
          </div>
          
          <button onClick={() => { setEditingItem(undefined); setIsFormOpen(true); }} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Register Supply
          </button>
        </header>

        {/* --- KPI Stats Matrix --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Capital in Stock", value: `$${totalValue.toLocaleString()}`, icon: DollarSign, trend: "Total Valuation", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { title: "Total Unique SKUs", value: inventory.length.toString(), icon: Layers, trend: "Active Items", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
            { title: "Low Stock Vectors", value: lowStockItems.length.toString(), icon: TrendingDown, trend: "Requires Attention", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { title: "Critical Depletion", value: criticalStockItems.length.toString(), icon: AlertTriangle, trend: "Zero Stock Remaining", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
          ].map((stat, i) => (
            <div key={i} className={`p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-colors shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{stat.title}</span>
                <div className={`p-2 rounded-lg border ${stat.bg} ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <h2 className="text-3xl font-black text-white">
                   {isLoading ? <div className="h-8 w-16 bg-neutral-800 animate-pulse rounded-lg" /> : stat.value}
                </h2>
              </div>
              <p className={`text-xs mt-2 font-medium ${stat.color}`}>{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* --- Toolbar --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0 pl-1">
            {["All", "Fabric", "Thread", "Accessories", "Hardware"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat ? "bg-neutral-800 text-white shadow-sm border border-neutral-700" : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto pr-1">
            <div className="w-full md:w-72 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
              <input type="text" placeholder="Search materials or colors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 pl-9 pr-4 text-white text-sm transition-all outline-none" />
            </div>
          </div>
        </div>

        {/* --- Data View: Table --- */}
        <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Supply Identifier</th>
                  <th className="px-6 py-5 font-bold">Specs & Financials</th>
                  <th className="px-6 py-5 font-bold">Current Stock Level</th>
                  <th className="px-6 py-5 font-bold">Quick Execute</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInventory.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">No supply vectors match your database query.</td></tr>
                ) : (
                  filteredInventory.map((item) => {
                    const quantity = Number(item.quantity);
                    const threshold = Number(item.alertThreshold);
                    const isLowStock = quantity <= threshold && quantity > 0;
                    const isCritical = quantity === 0;

                    return (
                      <tr key={item.id} className={`hover:bg-white/[0.02] transition-colors group ${isLowStock ? 'bg-amber-500/[0.02]' : isCritical ? 'bg-rose-500/[0.02]' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono text-neutral-500">{item.id}</span>
                              <CategoryBadge category={item.category} />
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 font-medium bg-neutral-900/50 w-fit px-2 py-0.5 rounded border border-neutral-800">
                               <Palette size={12} className="text-neutral-500" /> {item.color || "N/A"}
                             </div>
                             <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono font-bold w-fit px-2 py-0.5">
                               <DollarSign size={12} /> {item.cost ? item.cost.toFixed(2) : "0.00"} / {item.unit}
                             </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 w-48">
                            <div className="flex items-center justify-between">
                              <span className={`font-mono font-bold text-lg ${isCritical ? 'text-rose-500' : isLowStock ? 'text-amber-400' : 'text-white'}`}>
                                {quantity} <span className="text-xs font-sans font-medium text-neutral-500">{item.unit}</span>
                              </span>
                              {(isLowStock || isCritical) && (
                                <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                  <AlertTriangle size={10} /> {isCritical ? 'Empty' : 'Low'}
                                </span>
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (quantity / (threshold * 3 || 1)) * 100)}%` }} className={`h-full rounded-full transition-colors duration-500 ${isCritical ? 'bg-transparent' : isLowStock ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg p-1 w-fit">
                            <button onClick={() => handleQuickAdjust(item.id, -1)} disabled={isCritical} className="p-1.5 hover:bg-rose-500/20 hover:text-rose-400 text-neutral-400 rounded disabled:opacity-30 transition-colors" title="Consume 1 Unit">
                              <Minus size={14} />
                            </button>
                            <div className="w-px h-4 bg-neutral-800 mx-1" />
                            <button onClick={() => handleQuickAdjust(item.id, 1)} className="p-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 text-neutral-400 rounded transition-colors" title="Add 1 Unit">
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none">
                            <MoreVertical size={18} />
                          </button>
                          
                          <AnimatePresence>
                            {activeMenuId === item.id && (
                              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.15 }} className="absolute right-8 top-10 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                                <div className="py-1">
                                  {/* NEW: Print SKU Label Button */}
                                  <button onClick={() => { setQrModalItem(item); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-purple-400 hover:bg-purple-500/10 transition-colors text-left">
                                    <QrCode size={14} /> Print SKU Label
                                  </button>
                                  
                                  <button onClick={() => handleOpenHistory(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors text-left">
                                    <History size={14} /> View Stock Logs
                                  </button>
                                  <button onClick={() => { setEditingItem(item as any); setIsFormOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors text-left">
                                    <Edit2 size={14} /> Edit Parameters
                                  </button>
                                  <div className="h-px bg-neutral-800 my-1" />
                                  <button onClick={() => handleDelete(item.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left">
                                    <Trash2 size={14} /> Delete Vector
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --- STOCK LEDGER MODAL --- */}
      <AnimatePresence>
        {selectedHistoryItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSelectedHistoryItem(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl pointer-events-auto overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-white/5 flex justify-between items-start bg-neutral-950/50">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2"><History className="text-cyan-400" size={20} /> Audit Ledger</h2>
                    <p className="text-sm text-neutral-400 mt-1 font-mono">{selectedHistoryItem.id} • {selectedHistoryItem.name}</p>
                  </div>
                  <button onClick={() => setSelectedHistoryItem(null)} className="p-2 bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 bg-neutral-900/50 space-y-4 no-scrollbar">
                  {(!selectedHistoryItem.logs || selectedHistoryItem.logs.length === 0) ? (
                    <div className="text-center py-10 text-neutral-500 text-sm">No activity recorded for this SKU yet.</div>
                  ) : (
                    selectedHistoryItem.logs.map((log) => (
                      <div key={log.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
                         <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${log.type === "IN" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                           {log.type === "IN" ? <Plus size={16}/> : <Minus size={16}/>}
                         </div>
                         <div className="flex-1">
                           <div className="flex justify-between items-start mb-1">
                             <span className="font-bold text-white text-sm">
                               {log.type === "IN" ? "Stock Replenished" : "Stock Consumed"} 
                               <span className={`ml-2 font-mono ${log.type === "IN" ? "text-emerald-400" : "text-rose-400"}`}>
                                 {log.type === "IN" ? "+" : "-"}{log.amount} {selectedHistoryItem.unit}
                               </span>
                             </span>
                             <span className="text-[10px] text-neutral-500 font-mono">{log.date}</span>
                           </div>
                           <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                             <span className="flex items-center gap-1"><UserCircle2 size={12}/> {log.user}</span>
                             <span>•</span>
                             <span className="flex items-center gap-1.5 font-mono">
                               {log.previousStock} <ArrowRightCircle size={10} className="text-neutral-600"/> {log.newStock}
                             </span>
                           </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* --- NEW: QR CODE GENERATOR MODAL --- */}
      <AnimatePresence>
        {qrModalItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setQrModalItem(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-sm bg-neutral-900 border border-purple-500/20 rounded-3xl pointer-events-auto overflow-hidden shadow-2xl shadow-purple-900/20">
                
                {/* Header */}
                <div className="p-5 flex justify-between items-start">
                  <h2 className="text-lg font-black text-white flex items-center gap-2"><QrCode className="text-purple-400" size={18} /> Print SKU Label</h2>
                  <button onClick={() => setQrModalItem(null)} className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {/* Display QR & Info */}
                <div className="p-6 bg-white flex flex-col items-center text-center">
                  <h3 className="text-black font-black text-lg leading-tight uppercase mb-4">{qrModalItem.name}</h3>
                  
                  {/* We attach an ID here so the print function can extract exactly this SVG data */}
                  <div id="qr-svg-container" className="bg-white p-2 border-2 border-black rounded-xl">
                    <QRCodeSVG value={qrModalItem.id} size={150} level="H" />
                  </div>
                  
                  <p className="font-mono font-bold text-black mt-4 tracking-wider text-xl">{qrModalItem.id}</p>
                  <p className="text-neutral-600 text-xs font-medium uppercase mt-1">{qrModalItem.category} • {qrModalItem.color || 'Standard'}</p>
                </div>

                {/* Print Action */}
                <div className="p-5 bg-neutral-950/50">
                  <button onClick={handlePrintQR} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-2">
                    <Printer size={16} /> Send to Printer
                  </button>
                  <p className="text-center text-[10px] text-neutral-500 mt-3">This will open a clean, printer-friendly window tailored for adhesive labels.</p>
                </div>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* --- FORM MODAL WITH SAVE LOGIC --- */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsFormOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <div className="pointer-events-auto relative w-full max-w-2xl">
                <InventoryForm 
                  initialData={editingItem} 
                  onSubmit={async (data: any) => {
                    try {
                      const isUpdating = !!editingItem?.id;
                      const endpoint = isUpdating ? `/api/inventory/adjust/${editingItem.id}` : '/api/inventory/adjust';
                      const method = isUpdating ? 'PATCH' : 'POST';

                      const response = await fetch(endpoint, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      });

                      if (!response.ok) throw new Error("Failed to save item");

                      setIsFormOpen(false);
                      fetchInventory(); 
                    } catch (error) {
                      console.error("Database Error:", error);
                      alert("Failed to save the inventory item.");
                    }
                  }} 
                  onCancel={() => setIsFormOpen(false)} 
                />
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}