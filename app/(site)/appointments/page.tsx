"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, MoreVertical, Edit2, Trash2, 
  Calendar as CalendarIcon, Clock, User, Scissors,
  CheckCircle2, XCircle, AlertCircle, X, Loader2, LayoutGrid, List
} from "lucide-react";
import AppointmentForm, { AppointmentData } from "@/components/forms/AppointmentForm";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Appointment extends AppointmentData {
  id: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/appointments');
      const json = await res.json();
      if (json.success) setAppointments(json.data);
      else setAppointments([]);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => statusFilter === "All" || apt.status === statusFilter);
  }, [appointments, statusFilter]);

  const todayCount = appointments.filter(a => a.date === "2026-06-04").length; // Mock today
  const pendingFittings = appointments.filter(a => a.type === "Fitting" && a.status === "Scheduled").length;

  const handleFormSubmit = async (formData: AppointmentData) => {
    setIsSubmitting(true);
    try {
      if (editingAppointment) {
        setAppointments(appointments.map(a => a.id === editingAppointment.id ? { ...a, ...formData } as Appointment : a));
      } else {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          const json = await res.json();
          if (json.success) setAppointments([...appointments, json.data].sort((a, b) => a.date.localeCompare(b.date)));
        } else {
          console.error("Failed to save appointment to database.");
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    // Optimistic UI update (changes instantly on screen)
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
    setActiveMenuId(null);
    
    // Save to the database
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error("Failed to update status in DB", error);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "Completed") return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Completed</span>;
    if (status === "Cancelled") return <span className="bg-neutral-800 text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Cancelled</span>;
  return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Scheduled</span>;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold tracking-widest uppercase mb-1">
              <CalendarIcon size={14} /> Schedule Matrix
              {isLoading && <Loader2 size={12} className="animate-spin ml-2" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Appointments</h1>
          </div>
          <button onClick={() => { setEditingAppointment(undefined); setIsModalOpen(true); }} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2">
            <Plus size={16} /> Book Time Slot
          </button>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg flex items-center justify-between">
            <div><span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Today's Agenda</span><h2 className="text-3xl font-black text-white mt-1">{todayCount}</h2></div>
            <div className="p-3 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400"><Clock size={20} /></div>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg flex items-center justify-between">
            <div><span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Pending Fittings</span><h2 className="text-3xl font-black text-white mt-1">{pendingFittings}</h2></div>
            <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-400"><Scissors size={20} /></div>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg flex items-center justify-between">
            <div><span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Bookings</span><h2 className="text-3xl font-black text-white mt-1">{appointments.length}</h2></div>
            <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-400"><CalendarIcon size={20} /></div>
          </div>
        </div>

        {/* Filters & View Toggles */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {["All", "Scheduled", "Completed", "Cancelled"].map((status) => (
              <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${statusFilter === status ? "bg-neutral-800 text-white border border-neutral-700 shadow-sm" : "text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent"}`}>
                {status}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 shrink-0 w-full sm:w-auto justify-center">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold px-3 ${viewMode === "list" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}><List size={14} /> List</button>
            <button onClick={() => setViewMode("calendar")} className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold px-3 ${viewMode === "calendar" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}><LayoutGrid size={14} /> Calendar</button>
          </div>
        </div>

        {/* Data View */}
        {viewMode === "calendar" ? (
          <div className="rounded-2xl bg-white p-4 h-[600px] shadow-xl border border-white/5">
            <Calendar
              localizer={localizer}
              events={filteredAppointments.map(apt => ({
                title: `${apt.customerName} - ${apt.type}`,
                start: new Date(`${apt.date}T${apt.time}`),
                end: new Date(new Date(`${apt.date}T${apt.time}`).getTime() + 60 * 60 * 1000), // Adds 1 hr
                resource: apt
              }))}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%', color: 'black' }}
              onSelectEvent={(event: any) => { setEditingAppointment(event.resource); setIsModalOpen(true); }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
               <div className="text-center p-12 bg-neutral-900/40 border border-white/5 rounded-2xl text-neutral-500">No appointments found.</div>
            ) : (
              filteredAppointments.map((apt) => (
                <div key={apt.id} className="bg-neutral-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-rose-500/30 transition-colors group">
                  
                  <div className="flex items-center gap-6 md:w-1/3">
                    <div className="flex flex-col items-center justify-center bg-neutral-950 border border-neutral-800 rounded-xl h-16 w-16 shrink-0">
                      <span className="text-xs font-bold text-rose-400 uppercase">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-xl font-black text-white">{apt.date.split('-')[2]}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{apt.customerName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-neutral-400"><Clock size={12}/> {apt.time}</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-xs text-indigo-400 font-medium">{apt.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:w-1/3 border-l border-white/5 pl-6">
                     <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-1">Staff / Notes</span>
                     <span className="text-sm text-neutral-300 flex items-center gap-1.5 mb-1"><User size={14} className="text-neutral-500"/> {apt.assignedTo}</span>
                     <p className="text-xs text-neutral-500 truncate" title={apt.notes}>{apt.notes || "No additional notes provided."}</p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/3 border-t md:border-none border-white/5 pt-4 md:pt-0">
                    <StatusBadge status={apt.status} />
                    
                    <div className="relative">
                      <button onClick={() => setActiveMenuId(activeMenuId === apt.id ? null : apt.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"><MoreVertical size={18} /></button>
                      <AnimatePresence>
                        {activeMenuId === apt.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-0 top-10 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-20 overflow-hidden text-left">
                            <div className="py-1">
                              <button onClick={() => handleStatusUpdate(apt.id, "Completed")} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"><CheckCircle2 size={14} /> Mark Completed</button>
                              <button onClick={() => handleStatusUpdate(apt.id, "Cancelled")} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-400 hover:bg-white/5 transition-colors"><XCircle size={14} /> Mark Cancelled</button>
                              <div className="h-px bg-neutral-800 my-1" />
                              <button onClick={() => { setEditingAppointment(apt); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors"><Edit2 size={14} /> Reschedule</button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                </div>
              ))
            )}
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
                <AppointmentForm initialData={editingAppointment} onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}