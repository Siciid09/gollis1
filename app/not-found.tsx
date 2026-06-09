"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scissors, ArrowLeft, Ruler, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex flex-col items-center justify-center relative overflow-hidden selection:bg-amber-500/30 font-sans no-scrollbar">
      
      {/* --- Ambient Luxury Glows --- */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- Floating Background Elements --- */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-32 text-amber-500/10 opacity-50"
      >
        <Scissors size={120} />
      </motion.div>

      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 right-32 text-indigo-500/10 opacity-50"
      >
        <Ruler size={100} />
      </motion.div>

      {/* --- Main Content --- */}
      <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
        
        {/* Animated 404 Typography */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative inline-block mb-4"
        >
          <h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-b from-neutral-100 via-neutral-500 to-neutral-900 leading-none tracking-tighter drop-shadow-2xl select-none">
            404
          </h1>
          
          {/* Animated Snip Line */}
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: "120%" }} 
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-2 border-dashed border-amber-500/50 flex items-center justify-end"
          >
            <motion.div 
              animate={{ x: [0, 10, 0], rotate: [0, 20, -10, 0] }} 
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-6 text-amber-400"
            >
              <Scissors size={24} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Text Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold uppercase tracking-widest text-rose-400 mb-6 backdrop-blur-sm">
            Pattern Not Found
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            We seem to have dropped a stitch.
          </h2>
          <p className="text-neutral-400 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            The fabric of this URL has frayed, or the page you are looking for was never measured for production in the atelier.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all border border-white/10 flex items-center justify-center gap-2 group active:scale-95"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Go Back
          </button>
          
          <Link 
            href="/dash"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-sm font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 group active:scale-95 hover:shadow-amber-500/40 hover:-translate-y-1 hover:scale-[1.02]"
          >
            <Home size={16} className="group-hover:scale-110 transition-transform" />
            Return to Atelier
          </Link>
        </motion.div>

      </div>

      {/* --- Minimal Footer --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-0 w-full text-center text-[10px] font-mono text-neutral-600 uppercase tracking-widest"
      >
        Yoonis Tailor System Matrix // Error Code: 404
      </motion.div>
      
    </div>
  );
}