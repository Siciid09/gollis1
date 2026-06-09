"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, DollarSign, Calendar, Save, 
  Tag, User, Layers, Loader2, Search, CheckCircle2
} from "lucide-react";

type OrderStatus = "Pending" | "Cutting" | "Stitching" | "Finishing" | "Ready" | "Delivered";

export interface OrderData {
  id?: string;
  customerId: string;
  customerName?: string; 
  physicalTag: string;   
  garmentType: string;
  quantity: number | string;
  fabric: string;
  deliveryDate: string;
  status: OrderStatus;
  total: number | string;
  deposit: number | string;
}

interface Customer {
  id: string;
  fullName: string;
  phone: string;
}

interface OrderFormProps {
  initialData?: OrderData;
  onSubmit: (data: OrderData) => void;
  onCancel: () => void;
}

const statuses: OrderStatus[] = ["Pending", "Cutting", "Stitching", "Finishing", "Ready", "Delivered"];

export default function OrderForm({ initialData, onSubmit, onCancel }: OrderFormProps) {
  const isEditing = !!initialData;
  
  const [data, setData] = useState<OrderData>(
    initialData || { 
      customerId: "", 
      customerName: "", 
      physicalTag: "", // Will auto-fill below
      garmentType: "Custom Suit", 
      quantity: 1, 
      fabric: "", 
      deliveryDate: "", 
      status: "Pending", 
      total: "", 
      deposit: "" 
    }
  );

  // --- Async Customer Search State ---
  const [searchTerm, setSearchTerm] = useState(initialData?.customerName || "");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // NEW: State for Tag Generation
  const [isGeneratingTag, setIsGeneratingTag] = useState(false);

  // --- Initialize Auto-Tag (Database Fetch Approach) ---
  useEffect(() => {
    const generateNextTag = async () => {
      setIsGeneratingTag(true);
      try {
        const response = await fetch('/api/orders');
        const result = await response.json();
        let nextNumber = 1;

        if (result.success && result.data && result.data.length > 0) {
          const tagNumbers = result.data
            .map((o: any) => {
              const match = o.physicalTag?.match(/\d+/);
              return match ? parseInt(match[0], 10) : 0;
            })
            .filter((n: number) => !isNaN(n));

          if (tagNumbers.length > 0) {
            nextNumber = Math.max(...tagNumbers) + 1;
          }
        }
        setData(prev => ({ ...prev, physicalTag: `TAG-${nextNumber}` }));
      } catch (error) {
        console.error("Failed to auto-generate tag:", error);
        // Fallback to random if DB fetch fails
        const randomId = Math.floor(1000 + Math.random() * 9000);
        setData(prev => ({ ...prev, physicalTag: `TAG-${randomId}` }));
      } finally {
        setIsGeneratingTag(false);
      }
    };

    if (!isEditing && !data.physicalTag) {
      generateNextTag();
    }
  }, [isEditing, data.physicalTag]);

  // --- Debounced Async Search Handler ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Reset selection if user starts typing a new name
    if (data.customerId) {
      setData(prev => ({ ...prev, customerId: "", customerName: "" }));
    }

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setIsSearching(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Replace with your actual search endpoint: e.g., `/api/customers/search?q=${value}`
        // Here we hit the main API and filter client-side if a specific search endpoint doesn't exist yet.
        const res = await fetch('/api/customers'); 
        const json = await res.json();
        if (json.success) {
          const filtered = json.data.filter((c: Customer) => 
            c.fullName.toLowerCase().includes(value.toLowerCase()) || 
            c.phone.includes(value)
          ).slice(0, 5); // Limit to top 5 results for sleekness
          setSearchResults(filtered);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce
  };

  const selectCustomer = (customer: Customer) => {
    setSearchTerm(customer.fullName);
    setData({ ...data, customerId: customer.id, customerName: customer.fullName });
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.customerId) {
      alert("Please search and select a valid client from the dropdown.");
      return;
    }
    onSubmit(data);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-3xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-inner">
          <Scissors size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{isEditing ? "Update Workshop Node" : "Initialize New Order"}</h2>
          <p className="text-xs text-neutral-400 mt-1">Bind customer parameters to physical materials and production timelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- Async Autocomplete Customer Search --- */}
        <div className="space-y-2 md:col-span-2 relative z-50">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex justify-between">
            <span>Client Binding</span>
            {data.customerId && <span className="text-emerald-400 text-[10px] flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>}
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" required
              value={searchTerm} 
              onChange={handleSearchChange}
              onFocus={() => { if (searchTerm) setShowDropdown(true) }}
              className={`w-full bg-neutral-950 border ${data.customerId ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' : 'border-neutral-800 focus:border-indigo-500 focus:ring-indigo-500'} focus:ring-1 rounded-xl py-3 pl-12 pr-10 text-white text-sm outline-none transition-all`} 
              placeholder="Search client by name or phone..." 
            />
            {isSearching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" />}
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Querying database...
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto no-scrollbar">
                    {searchResults.map(customer => (
                      <li 
                        key={customer.id} 
                        onClick={() => selectCustomer(customer)}
                        className="px-4 py-3 hover:bg-indigo-500/10 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0 transition-colors"
                      >
                        <span className="text-sm font-bold text-white">{customer.fullName}</span>
                        <span className="text-xs font-mono text-neutral-500">{customer.phone}</span>
                      </li>
                    ))}
                  </ul>
                ) : searchTerm.trim() ? (
                  <div className="p-4 text-center text-xs text-neutral-500">
                    No clients found. Please register them first.
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Auto-Generated Bag Tag --- */}
        <div className="space-y-2 relative overflow-hidden rounded-xl">
          {isGeneratingTag && <div className="absolute top-0 left-0 h-1 bg-indigo-500 animate-pulse w-full z-10" />}
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">Physical Bag / Tag ID</span>
            {isGeneratingTag && <span className="text-[10px] text-indigo-400/70 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Generating...</span>}
          </label>
          <div className="relative group mt-2">
            <Tag className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors size={18} ${isGeneratingTag ? 'text-indigo-500 animate-pulse' : 'text-indigo-500/50 group-focus-within:text-indigo-400'}`} />
            <input 
              type="text" required
              disabled={isGeneratingTag}
              value={data.physicalTag} 
              onChange={(e) => setData({...data, physicalTag: e.target.value.toUpperCase()})} 
              className="w-full bg-indigo-500/5 border border-indigo-500/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-indigo-100 font-bold font-mono text-sm outline-none transition-all disabled:opacity-50" 
              placeholder="e.g. TAG-12" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Garment Classification</label>
          <div className="relative group mt-2">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input type="text" required value={data.garmentType} onChange={(e) => setData({...data, garmentType: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="e.g. 3-Piece Suit" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Quantity</label>
          <div className="relative group mt-2">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors text-sm font-bold">#</div>
            <input type="number" min="1" required value={data.quantity} onChange={(e) => setData({...data, quantity: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="1" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Fabric Material</label>
          <div className="relative group mt-2">
            <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input type="text" required value={data.fabric} onChange={(e) => setData({...data, fabric: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="e.g. Italian Navy Wool" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Delivery SLA / Deadline</label>
          <div className="relative group mt-2">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input type="date" required value={data.deliveryDate} onChange={(e) => setData({...data, deliveryDate: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Total Contract Value ($)</label>
          <div className="relative group mt-2">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input type="number" min="0" required value={data.total} onChange={(e) => setData({...data, total: e.target.value})} className="w-full bg-neutral-950 border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="0.00" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Initial Deposit ($)</label>
          <div className="relative group mt-2">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input type="number" min="0" required value={data.deposit} onChange={(e) => setData({...data, deposit: e.target.value})} className="w-full bg-neutral-950 border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="0.00" />
          </div>
        </div>

        <div className="space-y-3 md:col-span-2 mt-4">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Current Production Node</label>
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (
              <div 
                key={status}
                onClick={() => setData({...data, status})}
                className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  data.status === status 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                }`}
              >
                {status}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
        <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"><Save size={16} /> Save Order</button>
      </div>
    </motion.form>
  );
}