"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, MoreVertical, Edit2, Trash2, 
  Search, BookImage, DollarSign, Layers,
  Ruler, LayoutGrid, List, Loader2, X
} from "lucide-react";
import CatalogForm, { CatalogData } from "@/components/forms/CatalogForm";

interface CatalogItem extends CatalogData {
  id: string;
}

export default function CatalogPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [anatomyFilter, setAnatomyFilter] = useState<string>("All"); // NEW
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | undefined>(undefined);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/catalog');
      const json = await res.json();
      if (json.success) setCatalog(json.data);
      else setCatalog([]);
    } catch (error) {
      console.error("Failed to fetch catalog:", error);
      setCatalog([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => 
      (categoryFilter === "All" || item.category === categoryFilter) &&
      (anatomyFilter === "All" || item.measurementTemplate === anatomyFilter) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [catalog, searchQuery, categoryFilter, anatomyFilter]);

  const handleFormSubmit = async (formData: CatalogData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        setCatalog(catalog.map(c => c.id === editingItem.id ? { ...c, ...formData } as CatalogItem : c));
      } else {
        const res = await fetch('/api/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.success) setCatalog([json.data, ...catalog]);
        } else {
          // Fallback inject
          const mockItem: CatalogItem = { ...formData, id: `CAT-${Math.floor(100 + Math.random() * 900)}` };
          setCatalog([mockItem, ...catalog]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      <div className="fixed top-[-10%] right-[10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold tracking-widest uppercase mb-1">
              <BookImage size={14} /> Design Showroom
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Garment Catalog</h1>
          </div>
          <button onClick={() => { setEditingItem(undefined); setIsModalOpen(true); }} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Add Blueprint
          </button>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0 pl-1">
            {["All", "Menswear", "Womenswear", "Uniforms", "Traditional"].map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${categoryFilter === cat ? "bg-neutral-800 text-white border border-neutral-700" : "text-neutral-500 hover:text-white"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto pr-1">
            <select 
              value={anatomyFilter} 
              onChange={(e) => setAnatomyFilter(e.target.value)}
              className="w-full md:w-auto bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-xl py-2.5 px-4 outline-none focus:border-violet-500 cursor-pointer appearance-none"
            >
              <option value="All">All Templates</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>
            <div className="w-full md:w-72 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-violet-400 transition-colors" size={16} />
              <input type="text" placeholder="Search designs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-2 pl-9 pr-4 text-white text-sm outline-none" />
            </div>
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 shrink-0">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}><List size={16} /></button>
            </div>
          </div>
        </div>

        {/* Data View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCatalog.map(item => (
              <div key={item.id} className="bg-neutral-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-5 flex flex-col hover:border-violet-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 group-hover:scale-110 transition-all">
                   <BookImage size={80} />
                </div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">{item.category}</span>
                  <div className="relative">
                    <button onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)} className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                    <AnimatePresence>
                      {activeMenuId === item.id && (
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 5 }} className="absolute right-0 top-8 w-36 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-20 overflow-hidden text-left">
                          <button onClick={() => { setEditingItem(item); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"><Edit2 size={14} /> Edit</button>
                          <button onClick={() => { if(confirm("Delete catalog item?")) setCatalog(catalog.filter(c => c.id !== item.id)); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /> Delete</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mb-4 flex-1 relative z-10">
                  <h3 className="text-lg font-black text-white leading-tight mb-1">{item.name}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">Base Price</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">${Number(item.basePrice).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">Anatomy Profile</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 mt-1"><Ruler size={10}/> {item.measurementTemplate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-hidden">
            {/* Standard table structure similar to other pages can go here if needed, but Grid is highly preferred for catalogs */}
            <div className="p-8 text-center text-neutral-500">List view active. (Grid view recommended for showrooms).</div>
          </div>
        )}

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
                <CatalogForm initialData={editingItem} onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function setInvoices(arg0: never[]) {
  throw new Error("Function not implemented.");
}
