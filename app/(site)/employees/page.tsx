"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, MoreVertical, Edit2, Trash2, 
  Users, Briefcase, Scissors, CheckCircle2,
  Filter, X, Loader2, UserCog, DollarSign, Wallet
} from "lucide-react";
import EmployeeForm, { EmployeeData } from "@/components/forms/EmployeeForm";

// --- TypeScript Interfaces ---
interface Employee extends EmployeeData {
  id: string;
  activeJobs: number;
  completedJobs: number;
  status: "Active" | "On Leave" | "Terminated";
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/employees');
      const json = await res.json();
      if (json.success) setEmployees(json.data);
      else setEmployees([]);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      (roleFilter === "All" || emp.role === roleFilter) &&
      (emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || emp.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [employees, searchQuery, roleFilter]);

  const totalPayroll = employees.reduce((sum, emp) => sum + Number(emp.salary), 0);
  const activeJobsTotal = employees.reduce((sum, emp) => sum + emp.activeJobs, 0);

  const handleFormSubmit = async (formData: EmployeeData) => {
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        // Optimistic update for presentation
        setEmployees(employees.map(e => e.id === editingEmployee.id ? { ...e, ...formData } as Employee : e));
      } else {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.success) setEmployees([json.data, ...employees]);
        } else {
          // Fallback inject if DB is down
          const mockEmp: Employee = { ...formData, id: `EMP-${Math.floor(100 + Math.random() * 900)}`, activeJobs: 0, completedJobs: 0, status: "Active" } as Employee;
          setEmployees([mockEmp, ...employees]);
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
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-1">
              <UserCog size={14} /> Human Resources Matrix
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Workforce Management</h1>
          </div>
          <button onClick={() => { setEditingEmployee(undefined); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Register Staff
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Active Workforce", value: employees.length.toString(), icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
            { title: "Monthly Payroll", value: `$${totalPayroll.toLocaleString()}`, icon: Wallet, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { title: "Garments in Progress", value: activeJobsTotal.toString(), icon: Scissors, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{stat.title}</span>
                <div className={`p-2 rounded-lg border ${stat.bg} ${stat.color}`}><stat.icon size={16} /></div>
              </div>
              <h2 className="text-3xl font-black text-white">{isLoading ? <div className="h-8 w-16 bg-neutral-800 animate-pulse rounded-lg" /> : stat.value}</h2>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0 pl-1">
            {["All", "Master Tailor", "Cutter", "Sewer", "Finisher", "Manager"].map((role) => (
              <button key={role} onClick={() => setRoleFilter(role)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${roleFilter === role ? "bg-neutral-800 text-white border border-neutral-700" : "text-neutral-500 hover:text-white"}`}>
                {role}
              </button>
            ))}
          </div>
          <div className="w-full md:w-72 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input type="text" placeholder="Search personnel..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 pl-9 pr-4 text-white text-sm outline-none" />
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-bold">Personnel Vector</th>
                  <th className="px-6 py-5 font-bold">Role & Skills</th>
                  <th className="px-6 py-5 font-bold">Financials</th>
                  <th className="px-6 py-5 font-bold">Operational Load</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold transition-colors ${emp.status === "Terminated" ? "text-neutral-500 line-through" : "text-white group-hover:text-indigo-400"}`}>
                            {emp.fullName}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-2">
                            {emp.id} • {emp.phone} 
                            {emp.status === "Terminated" && <span className="text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">TERMINATED</span>}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 flex flex-col gap-1">
                      <span className="text-xs font-bold text-neutral-300 w-fit px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded">{emp.role}</span>
                      <span className="text-[10px] text-neutral-500 max-w-[150px] truncate" title={emp.skills}>{emp.skills || "Standard Tasks"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-400">${Number(emp.salary).toLocaleString()}<span className="text-[10px] text-neutral-500">/mo</span></span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col"><span className="text-xs font-bold text-amber-400 flex items-center gap-1"><Scissors size={12}/> {emp.activeJobs}</span><span className="text-[9px] uppercase text-neutral-500">Active</span></div>
                        <div className="flex flex-col"><span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12}/> {emp.completedJobs}</span><span className="text-[9px] uppercase text-neutral-500">Done</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"><MoreVertical size={18} /></button>
                      <AnimatePresence>
                        {activeMenuId === emp.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-8 top-10 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                            <div className="py-1">
                              <button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"><Edit2 size={14} /> Update Profile</button>
                              <div className="h-px bg-neutral-800 my-1" />
                              <button 
                                onClick={() => { 
                                  if(confirm("Terminate this profile?")) {
                                    setEmployees(employees.map(e => e.id === emp.id ? { ...e, status: "Terminated" } : e));
                                    // In production, add: fetch(`/api/employees/${emp.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Terminated' }) });
                                  }
                                  setActiveMenuId(null); 
                                }} 
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 size={14} /> Terminate Record
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

      </div>

      {/* Modal Wrapper */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => !isSubmitting && setIsModalOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <div className="pointer-events-auto relative w-full max-w-2xl">
                <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 z-10 p-2 bg-neutral-900/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-full transition-colors backdrop-blur-md">
                  <X size={18} />
                </button>
                <EmployeeForm initialData={editingEmployee} onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}