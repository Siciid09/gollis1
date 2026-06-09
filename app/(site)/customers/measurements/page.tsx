"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, MoreVertical, Edit2, Trash2, 
  Search, Ruler, Printer, Loader2, X,
  User, CheckCircle2, History, Scissors,
  Save
} from "lucide-react";

// --- Strict Scope Interfaces ---
interface MeasurementRecord {
  id: string;
  customerId: string;
  customerName: string; // Stored for easier display
  gender: "Male" | "Female";
  measurementDate: string;
  
  // Male Fields
  neck?: string;
  chest?: string;
  waist?: string;
  hip?: string;
  shoulder?: string;
  sleeveLength?: string;
  shirtLength?: string;
  trouserLength?: string;

  // Female Fields
  bust?: string;
  sleeve?: string;
  dressLength?: string;
  
  notes?: string;
}

interface CustomerOption {
  id: string;
  fullName: string;
  gender: "Male" | "Female";
}

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"All" | "Male" | "Female">("All");
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<MeasurementRecord | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<MeasurementRecord>>({
    customerId: "", customerName: "", gender: "Male", measurementDate: new Date().toISOString().split('T')[0],
    neck: "", chest: "", waist: "", hip: "", shoulder: "", sleeveLength: "", shirtLength: "", trouserLength: "",
    bust: "", sleeve: "", dressLength: "", notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [measRes, custRes] = await Promise.all([
        fetch('/api/measurements'),
        fetch('/api/customers')
      ]);
      
      const measJson = await measRes.json();
      const custJson = await custRes.json();
      
      if (measJson.success) setMeasurements(measJson.data);
      if (custJson.success) setCustomers(custJson.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMeasurements = useMemo(() => {
    return measurements.filter(m => 
      (genderFilter === "All" || m.gender === genderFilter) &&
      (m.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [measurements, searchQuery, genderFilter]);

  // KPIs
  const totalProfiles = measurements.length;
  const maleProfiles = measurements.filter(m => m.gender === "Male").length;
  const femaleProfiles = measurements.filter(m => m.gender === "Female").length;
  const recentlyUpdated = measurements.filter(m => {
    const diffTime = Math.abs(new Date().getTime() - new Date(m.measurementDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 7;
  }).length;

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    const selectedCust = customers.find(c => c.id === custId);
    if (selectedCust) {
      setFormData({ 
        ...formData, 
        customerId: selectedCust.id, 
        customerName: selectedCust.fullName, 
        gender: selectedCust.gender 
      });
    } else {
      setFormData({ ...formData, customerId: "", customerName: "", gender: "Male" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return alert("Please select a customer.");
    
    setIsSubmitting(true);
    try {
      const method = activeRecord ? 'PATCH' : 'POST';
      const res = await fetch('/api/measurements', {
        method, headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(activeRecord ? { ...formData, id: activeRecord.id } : formData)
      });
      
      if (res.ok) {
        fetchData();
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Failed to save record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this measurement profile?")) {
      setMeasurements(measurements.filter(i => i.id !== id));
      setActiveMenuId(null);
      try {
        await fetch(`/api/measurements?id=${id}`, { method: 'DELETE' });
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
      {/* Background Glow - Amber/Orange Theme */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* --- INJECT PRINT CSS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-card, #printable-card * { visibility: visible; }
          #printable-card { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; background: white; color: black; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Ruler size={14} /> Anatomical Data
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Measurement Management</h1>
          </div>
          <button onClick={() => { 
            setActiveRecord(null); 
            setFormData({ customerId: "", customerName: "", gender: "Male", measurementDate: new Date().toISOString().split('T')[0], neck: "", chest: "", waist: "", hip: "", shoulder: "", sleeveLength: "", shirtLength: "", trouserLength: "", bust: "", sleeve: "", dressLength: "", notes: "" }); 
            setIsFormOpen(true); 
          }} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Record Measurements
          </button>
        </header>

        {/* Gradient KPI Cards (Amber Theme) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Profiles", value: totalProfiles.toString(), icon: <History size={20} className="text-amber-100" />, bg: "bg-gradient-to-br from-amber-600 to-orange-500 border-amber-500/30" },
            { title: "Male Metrics", value: maleProfiles.toString(), icon: <User size={20} className="text-orange-100" />, bg: "bg-gradient-to-br from-orange-600 to-red-500 border-orange-500/30" },
            { title: "Female Metrics", value: femaleProfiles.toString(), icon: <User size={20} className="text-rose-100" />, bg: "bg-gradient-to-br from-rose-500 to-pink-500 border-rose-500/30" },
            { title: "Recently Updated (7d)", value: recentlyUpdated.toString(), icon: <CheckCircle2 size={20} className="text-emerald-100" />, bg: "bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-500/30" },
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
            {["All", "Male", "Female"].map((gen) => (
              <button key={gen} onClick={() => setGenderFilter(gen as any)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${genderFilter === gen ? "bg-neutral-800 text-white border border-neutral-700" : "text-neutral-500 hover:text-white"}`}>
                {gen} Profiles
              </button>
            ))}
          </div>
          <div className="w-full md:w-72 relative group pr-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-400 transition-colors" size={16} />
            <input type="text" placeholder="Search customer name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2 pl-9 pr-4 text-white text-sm outline-none" />
          </div>
        </div>

        {/* Table View */}
        <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Client Overview</th>
                  <th className="px-6 py-5 font-bold">Anatomy/Gender</th>
                  <th className="px-6 py-5 font-bold">Last Measured</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMeasurements.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500 font-medium">No measurement records found.</td></tr>
                ) : (
                  filteredMeasurements.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{record.customerName}</span>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5">ID: {record.customerId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          record.gender === "Male" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                        }`}>{record.gender} Template</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-300 text-xs">{record.measurementDate}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setActiveMenuId(activeMenuId === record.id ? null : record.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none"><MoreVertical size={18} /></button>
                        <AnimatePresence>
                          {activeMenuId === record.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-8 top-10 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                              <button onClick={() => { setActiveRecord(record); setIsPrintOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"><Printer size={14}/> Print Job Card</button>
                              <button onClick={() => { setFormData(record); setActiveRecord(record); setIsFormOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"><Edit2 size={14} /> Update Metrics</button>
                              <div className="h-px bg-neutral-800 my-1" />
                              <button onClick={() => handleDelete(record.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /> Delete Profile</button>
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

      {/* --- FORM MODAL (RECORD MEASUREMENTS) --- */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => !isSubmitting && setIsFormOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleSubmit} className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl pointer-events-auto shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white">{activeRecord ? "Update Client Metrics" : "New Measurement Record"}</h2>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-neutral-500 hover:text-white"><X size={20}/></button>
                </div>
                
                {/* Client Selection */}
                <div className="space-y-4 mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Select Customer</label>
                      <select required disabled={!!activeRecord} value={formData.customerId} onChange={handleCustomerSelect} className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none disabled:opacity-50">
                        <option value="" disabled>-- Choose Client --</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.gender})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Measurement Date</label>
                      <input type="date" required value={formData.measurementDate} onChange={(e) => setFormData({...formData, measurementDate: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none" />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC METRIC FIELDS BASED ON STRICT SCOPE GENDER */}
                <div className="grid grid-cols-2 gap-4">
                  {formData.gender === "Male" ? (
                    <>
                      {[
                        { key: "neck", label: "Neck" }, { key: "chest", label: "Chest" },
                        { key: "waist", label: "Waist" }, { key: "hip", label: "Hip" },
                        { key: "shoulder", label: "Shoulder" }, { key: "sleeveLength", label: "Sleeve Length" },
                        { key: "shirtLength", label: "Shirt Length" }, { key: "trouserLength", label: "Trouser Length" }
                      ].map(m => (
                        <div key={m.key}>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">{m.label}</label>
                          <input type="number" step="0.25" value={(formData as any)[m.key]} onChange={(e) => setFormData({...formData, [m.key]: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl py-2 px-3 text-white text-sm outline-none" placeholder="0.00" />
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { key: "bust", label: "Bust" }, { key: "waist", label: "Waist" },
                        { key: "hip", label: "Hip" }, { key: "shoulder", label: "Shoulder" },
                        { key: "sleeve", label: "Sleeve" }, { key: "dressLength", label: "Dress Length" }
                      ].map(m => (
                        <div key={m.key}>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">{m.label}</label>
                          <input type="number" step="0.25" value={(formData as any)[m.key]} onChange={(e) => setFormData({...formData, [m.key]: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl py-2 px-3 text-white text-sm outline-none" placeholder="0.00" />
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Tailor Notes (Optional)</label>
                  <textarea rows={2} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl py-2 px-4 text-white text-sm outline-none resize-none" placeholder="Special adjustments..." />
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-6">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">{isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save Record</button>
                </div>
              </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* --- PRINT MEASUREMENT CARD MODAL --- */}
      <AnimatePresence>
        {isPrintOpen && activeRecord && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 no-print" onClick={() => setIsPrintOpen(false)} />
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 pointer-events-none">
              
              <div className="w-full max-w-lg flex justify-end gap-3 mb-4 pointer-events-auto no-print">
                <button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20">
                  <Printer size={16}/> Print Job Card
                </button>
                <button onClick={() => setIsPrintOpen(false)} className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-lg transition-colors">
                  <X size={20}/>
                </button>
              </div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} 
                id="printable-card"
                className="bg-white text-black w-full max-w-lg rounded-sm shadow-2xl p-8 pointer-events-auto border-4 border-double border-neutral-200"
              >
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                  <h1 className="text-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"><Scissors size={20}/> TAILOR JOB CARD</h1>
                  <p className="text-sm font-bold mt-1 text-neutral-600">Date: {activeRecord.measurementDate}</p>
                </div>

                <div className="mb-6 bg-neutral-100 p-4 rounded border border-neutral-300">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Client</h3>
                  <p className="text-xl font-black">{activeRecord.customerName}</p>
                  <p className="text-sm font-mono text-neutral-600">Profile: {activeRecord.gender}</p>
                </div>

                <h3 className="text-sm font-black uppercase tracking-widest border-b border-neutral-300 pb-1 mb-4">Anatomical Metrics (Inches)</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                  {activeRecord.gender === "Male" ? (
                    <>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Neck</span> <span className="font-mono">{activeRecord.neck || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Chest</span> <span className="font-mono">{activeRecord.chest || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Waist</span> <span className="font-mono">{activeRecord.waist || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Hip</span> <span className="font-mono">{activeRecord.hip || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Shoulder</span> <span className="font-mono">{activeRecord.shoulder || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Sleeve Length</span> <span className="font-mono">{activeRecord.sleeveLength || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Shirt Length</span> <span className="font-mono">{activeRecord.shirtLength || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Trouser Length</span> <span className="font-mono">{activeRecord.trouserLength || "--"}</span></div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Bust</span> <span className="font-mono">{activeRecord.bust || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Waist</span> <span className="font-mono">{activeRecord.waist || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Hip</span> <span className="font-mono">{activeRecord.hip || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Shoulder</span> <span className="font-mono">{activeRecord.shoulder || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Sleeve</span> <span className="font-mono">{activeRecord.sleeve || "--"}</span></div>
                      <div className="flex justify-between border-b border-dotted border-neutral-400"><span className="font-bold">Dress Length</span> <span className="font-mono">{activeRecord.dressLength || "--"}</span></div>
                    </>
                  )}
                </div>

                {activeRecord.notes && (
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest border-b border-neutral-300 pb-1 mb-2">Tailor Notes</h3>
                    <p className="text-sm italic text-neutral-700">{activeRecord.notes}</p>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}