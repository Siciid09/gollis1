"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Save, AlertCircle } from "lucide-react";

export type Measurements = {
  id?: string;
  customerId: string;
  neck: string; 
  chest: string; 
  waist: string;
  hip: string; 
  shoulder: string; 
  sleeveLength: string;
  shirtLength: string; 
  trouserLength: string; 
  thigh: string;
};

interface MeasurementFormProps {
  initialData?: Measurements;
  onSubmit: (data: Measurements) => void;
  onCancel: () => void;
}

export default function MeasurementForm({ initialData, onSubmit, onCancel }: MeasurementFormProps) {
  const isEditing = !!initialData;
  const [data, setData] = useState<Measurements>(
    initialData || { customerId: "", neck: "", chest: "", waist: "", hip: "", shoulder: "", sleeveLength: "", shirtLength: "", trouserLength: "", thigh: "" }
  );

  // Tracks which input is currently focused for the anatomy guide
  const [focusedMetric, setFocusedMetric] = useState<string | null>(null);

  const metrics = [
    { key: "neck", label: "Neck Circumference" }, 
    { key: "chest", label: "Chest / Bust" }, 
    { key: "waist", label: "Natural Waist" },
    { key: "hip", label: "Hip / Seat" }, 
    { key: "shoulder", label: "Shoulder Width" }, 
    { key: "sleeveLength", label: "Sleeve Length" },
    { key: "shirtLength", label: "Shirt / Top Length" }, 
    { key: "trouserLength", label: "Trouser Outseam" }, 
    { key: "thigh", label: "Thigh Circumference" }
  ];

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-4xl mx-auto shadow-2xl flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      {/* Left Column: Form Inputs */}
      <div className="flex-1">
        <div className="mb-8 border-b border-white/5 pb-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shadow-inner">
            <Ruler size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">{isEditing ? "Update Metrics" : "Record Anatomy Metrics"}</h2>
            <p className="text-xs text-neutral-400 mt-1">Select a field to view the precise anatomical measurement zone.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.map((m) => (
            <div key={m.key} className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{m.label}</label>
              <div className="relative group">
                <input 
                  type="number" step="0.25" min="0"
                  value={(data as any)[m.key]}
                  onChange={(e) => setData({...data, [m.key]: e.target.value})}
                  onFocus={() => setFocusedMetric(m.key)}
                  onBlur={() => setFocusedMetric(null)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 pl-4 pr-10 text-white text-sm transition-all outline-none shadow-inner"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-600 pointer-events-none">in</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all">Abort</button>
          <button type="button" onClick={() => onSubmit(data)} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/20 active:scale-95"><Save size={16} /> Save Metrics</button>
        </div>
      </div>

      {/* Right Column: Visual Anatomy Guide (SVG) */}
      <div className="hidden md:flex flex-col items-center justify-center w-64 shrink-0 bg-neutral-950/50 rounded-2xl border border-white/5 p-4 relative">
        <span className="absolute top-4 left-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Blueprint</span>
        
        <svg viewBox="0 0 200 400" className="w-full h-auto max-h-[350px] opacity-80 mt-4">
          <defs>
            {/* Soft glow filter for active areas */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Base Mannequin Wireframe */}
          <g stroke="#3f3f46" strokeWidth="2" fill="none" strokeLinecap="round">
            {/* Head */}
            <circle cx="100" cy="40" r="20" />
            
            {/* Neck */ isActive(focusedMetric, 'neck') 
              ? <rect x="90" y="60" width="20" height="15" fill="#f59e0b" filter="url(#glow)" stroke="none" />
              : <rect x="90" y="60" width="20" height="15" />
            }

            {/* Shoulders */ isActive(focusedMetric, 'shoulder')
              ? <line x1="50" y1="75" x2="150" y2="75" stroke="#f59e0b" strokeWidth="6" filter="url(#glow)" />
              : <line x1="50" y1="75" x2="150" y2="75" />
            }

            {/* Chest */ isActive(focusedMetric, 'chest')
              ? <ellipse cx="100" cy="110" rx="45" ry="15" stroke="#f59e0b" strokeWidth="4" fill="#f59e0b" fillOpacity="0.2" filter="url(#glow)" />
              : <ellipse cx="100" cy="110" rx="45" ry="15" strokeDasharray="4 4" />
            }

            {/* Waist */ isActive(focusedMetric, 'waist')
              ? <ellipse cx="100" cy="160" rx="35" ry="12" stroke="#f59e0b" strokeWidth="4" fill="#f59e0b" fillOpacity="0.2" filter="url(#glow)" />
              : <ellipse cx="100" cy="160" rx="35" ry="12" strokeDasharray="4 4" />
            }

            {/* Hip */ isActive(focusedMetric, 'hip')
              ? <ellipse cx="100" cy="210" rx="48" ry="18" stroke="#f59e0b" strokeWidth="4" fill="#f59e0b" fillOpacity="0.2" filter="url(#glow)" />
              : <ellipse cx="100" cy="210" rx="48" ry="18" strokeDasharray="4 4" />
            }

            {/* Arms / Sleeve Length */ isActive(focusedMetric, 'sleeveLength')
              ? <>
                  <line x1="50" y1="75" x2="30" y2="190" stroke="#f59e0b" strokeWidth="4" filter="url(#glow)" />
                  <line x1="150" y1="75" x2="170" y2="190" stroke="#f59e0b" strokeWidth="4" filter="url(#glow)" />
                </>
              : <>
                  <line x1="50" y1="75" x2="30" y2="190" />
                  <line x1="150" y1="75" x2="170" y2="190" />
                </>
            }

            {/* Shirt Length */ isActive(focusedMetric, 'shirtLength')
              ? <line x1="100" y1="75" x2="100" y2="210" stroke="#f59e0b" strokeWidth="4" filter="url(#glow)" />
              : <line x1="100" y1="75" x2="100" y2="210" strokeDasharray="2 4" />
            }

            {/* Legs Base */}
            <path d="M 100 228 L 100 240 M 70 220 L 70 380 M 130 220 L 130 380" />

            {/* Trouser Length */ isActive(focusedMetric, 'trouserLength')
              ? <line x1="60" y1="210" x2="60" y2="380" stroke="#f59e0b" strokeWidth="4" filter="url(#glow)" />
              : null
            }

            {/* Thigh */ isActive(focusedMetric, 'thigh')
              ? <>
                  <ellipse cx="70" cy="260" rx="20" ry="8" stroke="#f59e0b" strokeWidth="3" fill="#f59e0b" fillOpacity="0.2" filter="url(#glow)" />
                  <ellipse cx="130" cy="260" rx="20" ry="8" stroke="#f59e0b" strokeWidth="3" fill="#f59e0b" fillOpacity="0.2" filter="url(#glow)" />
                </>
              : <>
                  <ellipse cx="70" cy="260" rx="20" ry="8" strokeDasharray="2 4" />
                  <ellipse cx="130" cy="260" rx="20" ry="8" strokeDasharray="2 4" />
                </>
            }
          </g>
        </svg>

        {/* Dynamic Label */}
        <div className="h-6 mt-4">
          <AnimatePresence mode="wait">
            {focusedMetric && (
              <motion.div 
                key={focusedMetric}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20"
              >
                {metrics.find(m => m.key === focusedMetric)?.label}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.form>
  );
}

// Helper function for cleaner SVG condition checks
function isActive(focused: string | null, key: string) {
  return focused === key;
}