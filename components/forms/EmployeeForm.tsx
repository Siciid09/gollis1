"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Briefcase, DollarSign, Wrench, Save, UserPlus, ShieldCheck } from "lucide-react";

export interface EmployeeData {
  id?: string;
  fullName: string;
  role: string;
  phone: string;
  salary: number | string;
  skills: string;
  hasSystemAccess?: boolean; // NEW: Access level tracking
}

interface EmployeeFormProps {
  initialData?: EmployeeData;
  onSubmit: (data: EmployeeData) => void;
  onCancel: () => void;
}

const ROLES = ["Master Tailor", "Cutter", "Sewer", "Finisher", "Manager"];

export default function EmployeeForm({ initialData, onSubmit, onCancel }: EmployeeFormProps) {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<EmployeeData>(
    initialData || { fullName: "", role: "Sewer", phone: "", salary: "", skills: "", hasSystemAccess: false }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, salary: Number(formData.salary) });
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="mb-8 border-b border-white/5 pb-6 flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-inner">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{isEditing ? "Update Personnel" : "Onboard New Staff"}</h2>
          <p className="text-xs text-neutral-400 mt-1">Register worker profiles, roles, and payroll data into the system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Full Identity</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="e.g. Jama Hassan" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Operational Role</label>
          <div className="relative group">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all">
              {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">▼</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Contact Vector</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="+252 63..." />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Monthly Base Salary ($)</label>
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input type="number" min="0" required value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full bg-neutral-950 border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="0.00" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex justify-between"><span>Specialized Skills</span> <span className="bg-neutral-800 px-1.5 rounded">Optional</span></label>
          <div className="relative group">
            <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="e.g. Embroidery, Heavy Fabrics" />
          </div>
        </div>

        {/* NEW: System Access Toggle */}
        <div 
          className={`md:col-span-2 mt-2 p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
            formData.hasSystemAccess 
              ? "border-indigo-500/40 bg-indigo-500/10 shadow-[4px_4px_0px_0px_rgba(99,102,241,0.2)]" 
              : "border-neutral-800 bg-neutral-950/50 hover:border-neutral-700"
          }`}
          onClick={() => setFormData({...formData, hasSystemAccess: !formData.hasSystemAccess})}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl transition-colors ${formData.hasSystemAccess ? "bg-indigo-500 text-white" : "bg-neutral-900 text-neutral-500 border border-neutral-800"}`}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className={`font-bold ${formData.hasSystemAccess ? "text-white" : "text-neutral-400"}`}>
                Grant App Login Access
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Allows this employee to log into the OS with restricted permissions.
              </p>
            </div>
          </div>
          
          <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex shrink-0 ${formData.hasSystemAccess ? 'bg-indigo-500' : 'bg-neutral-800'}`}>
            <motion.div 
              layout 
              className="w-4 h-4 rounded-full bg-white shadow-sm" 
              animate={{ x: formData.hasSystemAccess ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </div>

      </div>

      <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
        <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"><Save size={16} /> {isEditing ? "Update Personnel" : "Onboard Employee"}</button>
      </div>
    </motion.form>
  );
}