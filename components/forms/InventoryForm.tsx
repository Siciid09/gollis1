"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Box, Layers, Save, AlertTriangle, 
  Hash, Ruler, PackageSearch, Palette, DollarSign,
  Loader2, QrCode
} from "lucide-react";

// --- TypeScript Interfaces ---
export type CategoryType = "Fabric" | "Thread" | "Buttons" | "Zippers" | "Accessories";

export interface InventoryItemData {
  id?: string;
  name: string;
  category: CategoryType;
  quantity: number | string;
  unit: string;
  alertThreshold: number | string;
  color?: string; 
  cost?: number | string; 
}

interface InventoryFormProps {
  initialData?: InventoryItemData;
  onSubmit: (data: InventoryItemData) => void;
  onCancel: () => void;
}

export default function InventoryForm({ initialData, onSubmit, onCancel }: InventoryFormProps) {
  const isEditing = !!initialData;
  
  // Initialize form state
  const [formData, setFormData] = useState<InventoryItemData>(
    initialData || { 
      id: "", // NEW: Track the ID in state
      name: "", 
      category: "Fabric", 
      quantity: "", 
      unit: "meters", 
      alertThreshold: "10",
      color: "",
      cost: "" 
    }
  );

  // NEW: State for Auto-Generating SKU
  const [isGeneratingId, setIsGeneratingId] = useState(false);

  // --- Auto-Generate Inventory SKU ---
  useEffect(() => {
    const generateNextSku = async () => {
      setIsGeneratingId(true);
      try {
        const response = await fetch('/api/inventory/adjust');
        const result = await response.json();
        let nextNumber = 1000; // Starting baseline for a professional look

        if (result.success && result.data && result.data.length > 0) {
          const idNumbers = result.data
            .map((item: any) => {
              const match = item.id?.match(/\d+/);
              return match ? parseInt(match[0], 10) : 0;
            })
            .filter((n: number) => !isNaN(n));

          if (idNumbers.length > 0) {
            nextNumber = Math.max(...idNumbers) + 1;
          }
        }
        setFormData(prev => ({ ...prev, id: `INV-${nextNumber}` }));
      } catch (error) {
        console.error("Failed to auto-generate SKU:", error);
        // Fallback if DB fetch fails
        const randomId = Math.floor(1000 + Math.random() * 9000);
        setFormData(prev => ({ ...prev, id: `INV-${randomId}` }));
      } finally {
        setIsGeneratingId(false);
      }
    };

    // Only generate if we are creating a new item and it doesn't have an ID yet
    if (!isEditing && !formData.id) {
      generateNextSku();
    }
  }, [isEditing, formData.id]);


  // --- Dynamic Logic: Auto-switch units based on category selection ---
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as CategoryType;
    let newUnit = formData.unit;

    if (newCategory === "Fabric") newUnit = "meters";
    if (newCategory === "Thread") newUnit = "spools";
    if (newCategory === "Buttons" || newCategory === "Zippers" || newCategory === "Accessories") newUnit = "pieces";

    setFormData({ 
      ...formData, 
      category: newCategory, 
      unit: newUnit 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure numbers are strictly typed for the database
    const dbReadyData = {
      ...formData,
      quantity: Number(formData.quantity),
      alertThreshold: Number(formData.alertThreshold),
      cost: formData.cost ? Number(formData.cost) : 0,
    };
    
    onSubmit(dbReadyData);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
      onSubmit={handleSubmit}
      className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl mx-auto shadow-2xl"
    >
      {/* --- Header --- */}
      <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shadow-inner">
          <PackageSearch size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isEditing ? "Update Supply Vector" : "Log New Inventory"}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isEditing 
              ? "Modify stock quantities, financial costs, or alert parameters." 
              : "Register raw materials into the warehouse database."}
          </p>
        </div>
      </div>

      {/* --- Form Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* --- NEW: Auto-Generated SKU --- */}
        <div className="space-y-2 md:col-span-2 relative overflow-hidden rounded-xl">
          {isGeneratingId && <div className="absolute top-0 left-0 h-1 bg-cyan-500 animate-pulse w-full z-10" />}
          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">Supply Identifier (SKU)</span>
            {isGeneratingId && <span className="text-[10px] text-cyan-400/70 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Generating...</span>}
          </label>
          <div className="relative group mt-2">
            <QrCode className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors size={18} ${isGeneratingId ? 'text-cyan-500 animate-pulse' : 'text-cyan-500/50 group-focus-within:text-cyan-400'}`} />
            <input 
              type="text" required
              disabled={true} // Always disabled so users can't mess up the SKU
              value={formData.id} 
              className="w-full bg-cyan-500/5 border border-cyan-500/30 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 pl-12 pr-4 text-cyan-100 font-bold font-mono text-sm outline-none transition-all opacity-80 cursor-not-allowed" 
              placeholder="e.g. INV-1024" 
            />
          </div>
        </div>
        
        {/* Item Designation (Name) */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Item Designation</label>
          <div className="relative group">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
              placeholder="e.g. Italian Navy Wool Blend" 
            />
          </div>
        </div>

        {/* Classification */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Classification Matrix</label>
          <div className="relative group">
            <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <select 
              value={formData.category} 
              onChange={handleCategoryChange} 
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all cursor-pointer"
            >
              <option value="Fabric">Fabric / Textiles</option>
              <option value="Thread">Thread / Stitching</option>
              <option value="Buttons">Buttons</option>
              <option value="Zippers">Zippers</option>
              <option value="Accessories">General Accessories</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">▼</div>
          </div>
        </div>

        {/* Dynamic Unit Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Measurement Unit</label>
          <div className="relative group">
            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <select 
              value={formData.unit} 
              onChange={(e) => setFormData({...formData, unit: e.target.value})} 
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all cursor-pointer"
            >
              <optgroup label="Length">
                <option value="meters">Meters (m)</option>
                <option value="yards">Yards (yd)</option>
              </optgroup>
              <optgroup label="Count">
                <option value="pieces">Pieces (pcs)</option>
                <option value="spools">Spools</option>
                <option value="boxes">Boxes</option>
              </optgroup>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">▼</div>
          </div>
        </div>

        {/* Color Tracking */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex justify-between">
            <span>Color Palette</span>
            <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded">Optional</span>
          </label>
          <div className="relative group">
            <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" 
              value={formData.color} 
              onChange={(e) => setFormData({...formData, color: e.target.value})} 
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
              placeholder="e.g. Midnight Navy" 
            />
          </div>
        </div>

        {/* Financial Cost Tracking */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Unit Purchase Cost ($)</label>
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              type="number" 
              min="0" step="0.01"
              value={formData.cost} 
              onChange={(e) => setFormData({...formData, cost: e.target.value})} 
              className="w-full bg-neutral-950 border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
              placeholder="0.00" 
            />
          </div>
        </div>

        {/* Current Stock */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Current Stock Level</label>
          <div className="relative group">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="number" 
              required min="0" step="0.01"
              value={formData.quantity} 
              onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
              placeholder="0.00" 
            />
          </div>
        </div>

        {/* Low Stock Alert Threshold */}
        <div className="space-y-2 md:col-span-2 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} /> Trigger Alert At
            </label>
            <p className="text-[11px] text-neutral-500 mt-1 leading-tight">
              The system will flag this item when stock falls below this number.
            </p>
          </div>
          <div className="w-full md:w-1/3 relative group">
            <input 
              type="number" 
              required min="0" step="0.01"
              value={formData.alertThreshold} 
              onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})} 
              className="w-full bg-neutral-950 border border-rose-500/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all text-center" 
              placeholder="e.g. 5" 
            />
          </div>
        </div>

      </div>

      {/* --- Form Actions --- */}
      <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
        >
          <Save size={16} /> 
          {isEditing ? "Update Stock DB" : "Inject into Warehouse"}
        </button>
      </div>
    </motion.form>
  );
}