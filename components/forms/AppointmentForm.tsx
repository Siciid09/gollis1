"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar as CalendarIcon, Clock, AlignLeft, Save, Briefcase, Scissors, Loader2, AlertCircle } from "lucide-react";

export interface AppointmentData {
  id?: string;
  customerName: string;
  type: string;
  date: string;
  time: string;
  assignedTo: string;
  notes: string;
  status: string;
}

interface AppointmentFormProps {
  initialData?: AppointmentData;
  onSubmit: (data: AppointmentData) => void;
  onCancel: () => void;
}

const APPOINTMENT_TYPES = ["Measurement", "Fitting", "Pickup", "Consultation"];
const STAFF_LIST = ["Omar Abdi (Master)", "Naima Muse (Cutter)", "Sulekha Osman (Sewer)", "Any Available"];

export default function AppointmentForm({ initialData, onSubmit, onCancel }: AppointmentFormProps) {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<AppointmentData>(
    initialData || { customerName: "", type: "Measurement", date: "", time: "", assignedTo: "Any Available", notes: "", status: "Scheduled" }
  );

  const [isChecking, setIsChecking] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setIsChecking(true);

    try {
      // Query the database via the API for existing appointments
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const { data } = await res.json();
        
        // Check if the assigned staff is already booked at the exact date and time
        const hasConflict = data.some((apt: AppointmentData) => 
          apt.date === formData.date && 
          apt.time === formData.time && 
          apt.assignedTo === formData.assignedTo && 
          apt.assignedTo !== "Any Available" && // Allow multiple overlaps for "Any Available"
          apt.id !== formData.id // Skip checking against itself if editing
        );

        if (hasConflict) {
          setConflictError(`Scheduling Conflict: ${formData.assignedTo} is already booked on this date at ${formData.time}.`);
          setIsChecking(false);
          return; // Abort submission
        }
      }
    } catch (error) {
      console.error("Failed to validate booking conflicts", error);
    }

    setIsChecking(false);
    onSubmit(formData);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="mb-8 border-b border-white/5 pb-6 flex items-center gap-4">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 shadow-inner">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{isEditing ? "Reschedule Appointment" : "Book Appointment"}</h2>
          <p className="text-xs text-neutral-400 mt-1">Reserve time slots for client measurements, fittings, and order dispatch.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Client Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-400 transition-colors" size={18} />
            <input type="text" required value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="Search or type client name..." />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Service Type</label>
          <div className="relative group">
            <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-400 transition-colors" size={18} />
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all">
              {APPOINTMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Assigned Staff</label>
          <div className="relative group">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-400 transition-colors" size={18} />
            <select value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all">
              {STAFF_LIST.map(staff => <option key={staff} value={staff}>{staff}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Date</label>
          <div className="relative group">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-400 transition-colors" size={18} />
            <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Time</label>
          <div className="relative group">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-400 transition-colors" size={18} />
            <input type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Booking Notes</label>
          <div className="relative group">
            <AlignLeft className="absolute left-4 top-4 text-neutral-500 group-focus-within:text-rose-400 transition-colors" size={18} />
            <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all resize-none" placeholder="e.g. Client needs to try on the trousers..." />
          </div>
        </div>
      </div>

      {/* Conflict Error Message Display */}
      <AnimatePresence>
        {conflictError && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }} 
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden mt-6"
          >
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-bold">
              <AlertCircle size={16} className="shrink-0" />
              {conflictError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isChecking}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isChecking}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {isChecking ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {isChecking ? "Verifying..." : "Confirm Booking"}
        </button>
      </div>
    </motion.form>
  );
}