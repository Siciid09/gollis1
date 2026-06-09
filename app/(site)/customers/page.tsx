"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, MoreVertical, Edit2, Trash2, 
  Ruler, ExternalLink, Users, TrendingUp, 
  UserCheck, Clock, Filter, LayoutGrid, List,
  ChevronLeft, ChevronRight, X, Loader2,
  Wallet, Scissors, ChevronDown, CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import CustomerForm from "@/components/forms/CustomerForm";

// --- TypeScript Interfaces ---
interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  gender: "Male" | "Female" | "All";
  notes: string;
  totalOrders: number;
  lastActive?: string;
  createdAt?: string;
  status: "Active" | "Inactive" | "New";
}

export default function CustomersPage() {
  // --- State Management ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deep-linking: Auto-open customer if URL has a hash (e.g. #customer-id)
  useEffect(() => {
    if (!isLoading && customers.length > 0 && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      const linkedCustomer = customers.find(c => c.id === hashId);
      if (linkedCustomer) {
        setEditingCustomer(linkedCustomer);
        setIsModalOpen(true);
      }
    }
  }, [isLoading, customers]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  // Advanced Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive" | "New">("All");
  const [filterGender, setFilterGender] = useState<"All" | "Male" | "Female">("All");

  // Modal & Slide-out State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [selectedProfile, setSelectedProfile] = useState<Customer | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Dynamic Database Fetching ---
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Deep-linking: Auto-open customer drawer if URL has a hash (e.g. #CUST-901)
  useEffect(() => {
    if (!isLoading && customers.length > 0 && typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      const linkedCustomer = customers.find(c => c.id === hashId);
      if (linkedCustomer) {
        setSelectedProfile(linkedCustomer);
      }
    }
  }, [isLoading, customers]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/customers');
      const json = await res.json();
      
      if (json.success) {
        setCustomers(json.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Derived State & Logic (Advanced Filtering) ---
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery) || (c.id && c.id.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === "All" || c.status === filterStatus;
      const matchesGender = filterGender === "All" || c.gender === filterGender;
      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [customers, searchQuery, filterStatus, filterGender]);

  const activeCount = customers.filter(c => c.status === "Active").length;
  const newCount = customers.filter(c => c.status === "New").length;

  // --- Handlers ---
  const handleOpenAddModal = () => {
    setEditingCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setEditingCustomer(customer);
    setIsModalOpen(true);
    setActiveMenuId(null);
    setSelectedProfile(null);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    if(confirm("Are you sure you want to permanently delete this client profile?")) {
      // 1. Optimistic UI Update (Hide it immediately)
      setCustomers(customers.filter(c => c.id !== id));
      setActiveMenuId(null);
      if(selectedProfile?.id === id) setSelectedProfile(null);
      
      // 2. Tell Firebase to permanently delete it
      try {
        await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error("Failed to delete customer from DB", error);
      }
    }
  };

  const handleRowClick = (customer: Customer) => {
    setSelectedProfile(customer);
    if (typeof window !== "undefined") {
      window.history.pushState(null, '', `#${customer.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Users size={14} /> Client Relationship Matrix
              {isLoading && <Loader2 size={12} className="animate-spin text-indigo-400 ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Customer Directory
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Live database connection fetching real-time client profiles and measurement histories.
            </p>
          </div>
          
          <button 
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Register Client
          </button>
        </header>

        {/* --- KPI Stats Matrix (Gradient Theme) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Database", value: customers.length.toString(), icon: <Users size={20} className="text-indigo-100" />, bg: "bg-gradient-to-br from-indigo-600 to-purple-500 border-indigo-500/30" },
            { title: "Active Clients", value: activeCount.toString(), icon: <UserCheck size={20} className="text-emerald-100" />, bg: "bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-500/30" },
            { title: "New Acquisitions", value: newCount.toString(), icon: <TrendingUp size={20} className="text-amber-100" />, bg: "bg-gradient-to-br from-amber-500 to-orange-500 border-amber-500/30" },
            { title: "Dormant Profiles", value: (customers.length - activeCount - newCount).toString(), icon: <Clock size={20} className="text-rose-100" />, bg: "bg-gradient-to-br from-rose-500 to-pink-500 border-rose-500/30" },
          ].map((stat, i) => (
            <div key={i} className={`p-5 rounded-2xl ${stat.bg} border shadow-lg relative overflow-hidden transition-transform hover:-translate-y-1`}>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 drop-shadow-sm">{stat.title}</span>
                <div className="p-2 bg-black/20 rounded-lg backdrop-blur-md">
                  {stat.icon}
                </div>
              </div>
              <h2 className="text-3xl font-black text-white relative z-10 drop-shadow-md">
                {isLoading ? <div className="h-8 w-16 bg-white/20 animate-pulse rounded-md" /> : stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* --- Toolbar: Search & Advanced Filter Popover --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="w-full md:w-96 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-12 pr-4 text-white text-sm transition-all outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isFilterOpen || filterGender !== "All" || filterStatus !== "All" ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-neutral-950 border-neutral-800 hover:border-neutral-600 text-neutral-300"}`}
            >
              <Filter size={16} /> Filters {(filterGender !== "All" || filterStatus !== "All") && <span className="h-2 w-2 rounded-full bg-indigo-500 ml-1"/>}
            </button>

            {/* Advanced Filter Popover Matrix */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-14 right-0 md:right-24 w-64 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl z-30 p-4"
                >
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider mb-2 block">Client Status</span>
                      <div className="grid grid-cols-2 gap-2">
                        {["All", "Active", "New", "Inactive"].map(st => (
                           <button key={st} onClick={() => setFilterStatus(st as any)} className={`text-xs py-1.5 rounded-lg border font-bold transition-all ${filterStatus === st ? "bg-indigo-600 border-indigo-500 text-white" : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800"}`}>
                             {st}
                           </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider mb-2 block">Demographic</span>
                      <div className="grid grid-cols-3 gap-2">
                        {["All", "Male", "Female"].map(g => (
                           <button key={g} onClick={() => setFilterGender(g as any)} className={`text-xs py-1.5 rounded-lg border font-bold transition-all ${filterGender === g ? "bg-indigo-600 border-indigo-500 text-white" : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800"}`}>
                             {g}
                           </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1">
              <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}><List size={18} /></button>
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}><LayoutGrid size={18} /></button>
            </div>
          </div>
        </div>

        {/* --- Data View: Table --- */}
        {viewMode === "table" && (
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                  <tr>
                    <th className="px-6 py-5 font-bold">Client Identity</th>
                    <th className="px-6 py-5 font-bold">Contact Details</th>
                    <th className="px-6 py-5 font-bold">Address & Reg. Date</th>
                    <th className="px-6 py-5 font-bold">Status</th>
                    <th className="px-6 py-5 font-bold">Orders</th>
                    <th className="px-6 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => handleRowClick(customer)}
                      className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg shrink-0 ${customer.gender === "Female" ? "bg-gradient-to-br from-pink-500 to-rose-600 shadow-rose-500/20" : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20"}`}>
                            {customer.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{customer.fullName}</div>
                            <div className="text-xs font-mono text-neutral-500">{customer.id} • {customer.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-neutral-300 font-medium">{customer.phone}</span>
                          {customer.email && <span className="text-[11px] text-neutral-500">{customer.email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-neutral-300 text-xs truncate max-w-[150px]">{customer.address || "N/A"}</span>
                          <span className="text-[10px] text-neutral-500 mt-0.5">Reg: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          customer.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          customer.status === "New" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-300">
                        {customer.totalOrders || 0} <span className="text-neutral-500 text-xs font-sans">units</span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === customer.id ? null : customer.id); }}
                          className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {activeMenuId === customer.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-8 top-10 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-20 overflow-hidden"
                            >
                              <div className="py-1 text-left">
                                <Link href={`/customers/${customer.id}/measurements`} className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-indigo-600/10 hover:text-indigo-400 transition-colors">
                                  <Ruler size={14} /> Update Metrics
                                </Link>
                                <button onClick={(e) => handleOpenEditModal(customer, e)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors text-left">
                                  <Edit2 size={14} /> Edit Profile
                                </button>
                                <Link href={`/orders/new?client=${customer.id}`} className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors">
                                  <ExternalLink size={14} /> New Order
                                </Link>
                                <div className="h-px bg-neutral-800 my-1" />
                                <button onClick={(e) => handleDelete(customer.id, e)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left">
                                  <Trash2 size={14} /> Delete Record
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- DEEP DIVE PROFILE DRAWER (NEW) --- */}
      <AnimatePresence>
        {selectedProfile && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedProfile(null);
                if (typeof window !== "undefined") window.history.pushState(null, '', window.location.pathname);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-neutral-950/90 backdrop-blur-3xl border-l border-white/10 z-50 overflow-y-auto no-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 md:p-8 space-y-8">
                
                {/* Header Profile Card */}
                <div className="flex justify-between items-start border-b border-white/5 pb-6">
                   <div className="flex items-center gap-5">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl ${selectedProfile.gender === "Female" ? "bg-gradient-to-br from-pink-500 to-rose-600" : "bg-gradient-to-br from-indigo-500 to-purple-600"}`}>
                        {selectedProfile.fullName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{selectedProfile.fullName}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-mono text-neutral-400">{selectedProfile.id}</span>
                          <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-bold uppercase">{selectedProfile.gender}</span>
                        </div>
                      </div>
                   </div>
                   <button onClick={() => {
                     setSelectedProfile(null);
                     if (typeof window !== "undefined") window.history.pushState(null, '', window.location.pathname);
                   }} className="p-2 bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-full transition-colors">
                     <X size={20} />
                   </button>
                </div>

                {/* Measurements Widget */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-white flex items-center gap-2"><Ruler size={16} className="text-amber-400"/> Anatomical Metrics</h3>
                     <button className="text-xs text-indigo-400 font-bold hover:underline">Edit</button>
                   </div>
                   {/* Strict Scope Anatomical Metrics based on gender */}
                   <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                     {(selectedProfile.gender === "Male" || selectedProfile.gender === "All") ? (
                       <>
                         {[
                           { label: "Neck", val: "15.5\"" },
                           { label: "Chest", val: "40.0\"" },
                           { label: "Waist", val: "34.0\"" },
                           { label: "Hip", val: "41.0\"" },
                           { label: "Shoulder", val: "18.5\"" },
                           { label: "Sleeve Length", val: "25.0\"" },
                           { label: "Shirt Length", val: "29.0\"" },
                           { label: "Trouser Length", val: "40.0\"" },
                         ].map(m => (
                           <div key={m.label} className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 text-center">
                             <span className="block text-[9px] text-neutral-500 uppercase font-bold truncate">{m.label}</span>
                             <span className="text-sm font-mono text-white">{m.val}</span>
                           </div>
                         ))}
                       </>
                     ) : (
                       <>
                         {[
                           { label: "Bust", val: "36.0\"" },
                           { label: "Waist", val: "28.0\"" },
                           { label: "Hip", val: "38.5\"" },
                           { label: "Shoulder", val: "16.0\"" },
                           { label: "Sleeve", val: "24.0\"" },
                           { label: "Dress Length", val: "58.0\"" },
                         ].map(m => (
                           <div key={m.label} className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 text-center">
                             <span className="block text-[9px] text-neutral-500 uppercase font-bold truncate">{m.label}</span>
                             <span className="text-sm font-mono text-white">{m.val}</span>
                           </div>
                         ))}
                       </>
                     )}
                   </div>
                </div>

                {/* Ledger & History Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Past Orders Widget */}
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Scissors size={16} className="text-indigo-400"/> Order Ledger</h3>
                    <div className="space-y-3">
                      {selectedProfile.totalOrders > 0 ? (
                        <>
                          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                            <div className="flex justify-between items-start mb-1"><span className="font-bold text-xs text-white">3-Piece Suit</span><span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">Delivered</span></div>
                            <span className="text-[10px] font-mono text-neutral-500">ORD-1042 • May 14, 2026</span>
                          </div>
                          {selectedProfile.totalOrders > 1 && (
                            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                              <div className="flex justify-between items-start mb-1"><span className="font-bold text-xs text-white">Linen Shirt</span><span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">Sewing</span></div>
                              <span className="text-[10px] font-mono text-neutral-500">ORD-1150 • Jun 01, 2026</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-neutral-500 text-center py-4">No manufacturing history found.</p>
                      )}
                    </div>
                  </div>

                  {/* Payment History Widget */}
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Wallet size={16} className="text-rose-400"/> Financial History</h3>
                    <div className="space-y-3">
                      {selectedProfile.totalOrders > 0 ? (
                        <>
                          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex justify-between items-center">
                            <div>
                              <span className="block font-bold text-xs text-white">Invoice INV-88</span>
                              <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-400"/> Paid Full</span>
                            </div>
                            <span className="font-mono text-sm text-emerald-400 font-bold">$185.00</span>
                          </div>
                          {selectedProfile.totalOrders > 1 && (
                            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex justify-between items-center">
                              <div>
                                <span className="block font-bold text-xs text-white">Invoice INV-92</span>
                                <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1"><AlertCircle size={10} className="text-rose-400"/> Pending</span>
                              </div>
                              <span className="font-mono text-sm text-rose-400 font-bold">$40.00</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-neutral-500 text-center py-4">No financial transactions recorded.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Modal Overlay for CustomerForm --- */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => !isSubmitting && setIsModalOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.5, bounce: 0.1 }} className="w-full max-w-3xl pointer-events-auto relative">
                <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 z-10 p-2 bg-neutral-900/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-full transition-colors backdrop-blur-md">
                  <X size={18} />
                </button>
                <CustomerForm 
  initialData={editingCustomer} 
  onSubmit={async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/customers', {
        method: editingCustomer ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: editingCustomer?.id })
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchCustomers(); // Refresh the list
      } else {
        alert("Error: " + json.error);
      }
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  }} 
  onCancel={() => setIsModalOpen(false)} 
/>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}