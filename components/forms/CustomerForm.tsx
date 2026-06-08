"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, MapPin, AlignLeft, Save, ShieldCheck, Ruler, Loader2 } from "lucide-react";

// --- TypeScript Interfaces ---
export interface CustomerData {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  notes: string;
}

interface CustomerFormProps {
  initialData?: CustomerData;
  // Make onSubmit async so the form can handle loading states while the parent routes
  onSubmit: (data: CustomerData, proceedToMeasurements: boolean) => Promise<void> | void;
  onCancel: () => void;
}

export default function CustomerForm({ initialData, onSubmit, onCancel }: CustomerFormProps) {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<CustomerData>(
    initialData || { 
      fullName: "", 
      phone: "", 
      email: "", 
      address: "", 
      gender: "Male", 
      notes: "" 
    }
  );

  const [recordMeasurementsNow, setRecordMeasurementsNow] = useState(!isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Pass the data and the toggle flag to the parent to handle the API and router push
      await onSubmit(formData, recordMeasurementsNow);
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-3xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-2">
          <ShieldCheck size={14} /> CRM Data Entry
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {isEditing ? "Update Client Profile" : "Register New Client"}
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          {isEditing 
            ? "Modify existing personal information and structural notes." 
            : "Initialize a new relationship record in the central database."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Full Identity</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" 
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm transition-all outline-none"
              placeholder="e.g. Ahmed Ali"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Contact Vector</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm transition-all outline-none"
              placeholder="+252 63..."
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Email Address</span>
            <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded">Optional</span>
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm transition-all outline-none"
              placeholder="client@domain.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Location / District</span>
            <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded">Optional</span>
          </label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm transition-all outline-none"
              placeholder="e.g. Sha'ab Area"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Demographic</label>
          <div className="relative group">
            <select 
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-white text-sm transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="Male">Male Profile</option>
              <option value="Female">Female Profile</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">▼</div>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Structural & Style Notes</span>
            <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded">Optional</span>
          </label>
          <div className="relative group">
            <AlignLeft className="absolute left-4 top-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <textarea 
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm transition-all outline-none resize-none"
              placeholder="e.g. Prefers slim fit, drops right shoulder slightly..."
            />
          </div>
        </div>

        {/* Measurement Transition Toggle */}
        <div 
          className={`md:col-span-2 mt-2 p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
            recordMeasurementsNow 
              ? "border-indigo-500/40 bg-indigo-500/10 shadow-[4px_4px_0px_0px_rgba(99,102,241,0.2)]" 
              : "border-neutral-800 bg-neutral-950/50 hover:border-neutral-700"
          }`}
          onClick={() => setRecordMeasurementsNow(!recordMeasurementsNow)}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl transition-colors ${recordMeasurementsNow ? "bg-indigo-500 text-white" : "bg-neutral-900 text-neutral-500 border border-neutral-800"}`}>
              <Ruler size={20} />
            </div>
            <div>
              <h4 className={`font-bold ${recordMeasurementsNow ? "text-white" : "text-neutral-400"}`}>
                Record Measurements Now
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Automatically transition to the anatomical metrics workflow after saving.
              </p>
            </div>
          </div>
          
          <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex shrink-0 ${recordMeasurementsNow ? 'bg-indigo-500' : 'bg-neutral-800'}`}>
            <motion.div 
              layout 
              className="w-4 h-4 rounded-full bg-white shadow-sm" 
              animate={{ x: recordMeasurementsNow ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
        <button 
          type="button" 
          disabled={isSubmitting}
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
        >
          Cancel Protocol
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSubmitting ? "Saving Data..." : isEditing ? "Commit Updates" : (recordMeasurementsNow ? "Save & Measure" : "Save Record")}
        </button>
      </div>
    </motion.form>
  );
}