"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, User, Receipt, CreditCard, 
  AlignLeft, Save, Loader2, Hash, Smartphone, Banknote
} from "lucide-react";

// --- TypeScript Interfaces ---
export interface PaymentData {
  id?: string;
  customerName: string;
  orderId: string;
  totalAmount: number | string;
  amountPaid: number | string;
  paymentMethod: string;
  transactionId?: string; // NEW: Added for Mobile Money/Bank Audits
  notes: string;
}

interface PaymentFormProps {
  initialData?: PaymentData;
  onSubmit: (data: PaymentData) => Promise<void> | void;
  onCancel: () => void;
}

const PAYMENT_METHODS = ["Cash", "Mobile Money (ZAAD/eDahab)", "Bank Transfer"];

export default function PaymentForm({ initialData, onSubmit, onCancel }: PaymentFormProps) {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<PaymentData>(
    initialData || { 
      customerName: "", 
      orderId: "", 
      totalAmount: "", 
      amountPaid: "", 
      paymentMethod: "Mobile Money (ZAAD/eDahab)", 
      transactionId: "",
      notes: "" 
    }
  );

  const [balance, setBalance] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate remaining balance whenever amounts change
  useEffect(() => {
    const total = Number(formData.totalAmount) || 0;
    const paid = Number(formData.amountPaid) || 0;
    setBalance(Math.max(0, total - paid));
  }, [formData.totalAmount, formData.amountPaid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        totalAmount: Number(formData.totalAmount),
        amountPaid: Number(formData.amountPaid),
      });
    } catch (error) {
      console.error("Payment processing failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if we need to show the audit/transaction ID field
  const requiresAuditId = formData.paymentMethod === "Mobile Money (ZAAD/eDahab)" || formData.paymentMethod === "Bank Transfer";

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="mb-8 border-b border-white/5 pb-6 flex items-center gap-4">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner">
          <DollarSign size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{isEditing ? "Update Ledger Entry" : "Process Payment"}</h2>
          <p className="text-xs text-neutral-400 mt-1">Log financial transactions, deposits, and mobile money pushes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Client Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input type="text" required value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="e.g. Ahmed Ali" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Associated Order ID</label>
          <div className="relative group">
            <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input type="text" required value={formData.orderId} onChange={(e) => setFormData({...formData, orderId: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="e.g. ORD-8021" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Contract Value ($)</label>
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input type="number" min="0" step="0.01" required value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="0.00" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Amount Paid Now ($)</label>
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input type="number" min="0" step="0.01" required value={formData.amountPaid} onChange={(e) => setFormData({...formData, amountPaid: e.target.value})} className="w-full bg-neutral-950 border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="0.00" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Payment Method / Channel</label>
          <div className="relative group">
            {formData.paymentMethod === "Cash" ? <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" size={18} /> :
             formData.paymentMethod === "Bank Transfer" ? <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" size={18} /> :
             <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" size={18} />}
            
            <select value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value, transactionId: ""})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all cursor-pointer">
              {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">▼</div>
          </div>
        </div>

        {/* --- DYNAMIC AUDIT FIELD: Only shows for Mobile Money & Bank Transfers --- */}
        <AnimatePresence>
          {requiresAuditId && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 md:col-span-2 overflow-hidden"
            >
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex justify-between">
                <span>Transaction Reference ID</span>
                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 rounded">Required for API / Audit</span>
              </label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  required 
                  value={formData.transactionId} 
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})} 
                  className="w-full bg-emerald-500/5 border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-emerald-100 font-mono text-sm outline-none transition-all" 
                  placeholder="e.g. TXN-99827364" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex justify-between"><span>Transaction Notes</span> <span className="bg-neutral-800 px-1.5 rounded">Optional</span></label>
          <div className="relative group">
            <AlignLeft className="absolute left-4 top-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <textarea rows={2} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all resize-none" placeholder="e.g. Final installment for the wedding suit..." />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-white/5 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Real-time Balance Visualizer */}
        <div className="bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800 flex items-center gap-3">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Remaining Balance:</span>
          <span className={`font-mono font-bold ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ${balance.toFixed(2)}
          </span>
          {balance === 0 && Number(formData.totalAmount) > 0 && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Fully Paid</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <button type="button" disabled={isSubmitting} onClick={onCancel} className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? "Processing..." : isEditing ? "Update Ledger" : "Confirm Payment"}
          </button>
        </div>
      </div>
    </motion.form>
  );
}