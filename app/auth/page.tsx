"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Firebase Imports ---
import { auth, db, googleProvider } from "@/lib/firebase"; 
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();
  
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // --- Session Listener (Redirects if already logged in) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        router.push("/dash");
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // --- Role Formatting Interceptor ---
  // Transforms legacy "Admin/Owner" roles to "Admin" exactly as requested
  const verifyAndFormatRole = async (uid: string) => {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const currentRole = userDocSnap.data().role;
      if (currentRole === "Admin/Owner") {
        await setDoc(userDocRef, { role: "Admin" }, { merge: true });
      }
    }
  };

  // --- Core Authentication Logic ---
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address first to reset your password.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetMsg("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setResetMsg(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Check and update legacy role if necessary, update last login
      await verifyAndFormatRole(userCredential.user.uid);
      await setDoc(doc(db, "users", userCredential.user.uid), { 
        lastLogin: serverTimestamp() 
      }, { merge: true });

      router.push("/dash");
    } catch (err: any) {
      console.error("Auth Error Detailed:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else {
        setError(`Authentication failed: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Create new Google user strictly as 'Admin' or base role
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || "Google User",
          email: user.email,
          role: "Admin", 
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        // Standardize existing role and update login time
        await verifyAndFormatRole(user.uid);
        await setDoc(userDocRef, { 
          lastLogin: serverTimestamp() 
        }, { merge: true });
      }
      
      router.push("/dash");
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError("Secure Google sign-in was cancelled or failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-neutral-200 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Super Modern Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-15%] right-[-5%] w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Main Glassmorphic Card */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[2rem] shadow-[0_0_80px_rgba(217,119,6,0.1)] overflow-hidden">
          
          {/* Header Section */}
          <div className="p-10 pb-8 text-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 20 }}
              className="flex justify-center mb-6"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 flex items-center justify-center text-white font-black text-3xl shadow-[0_0_30px_rgba(217,119,6,0.4)] relative group cursor-default">
                <div className="absolute inset-0 bg-white/20 blur-md rounded-2xl transition-transform duration-500 group-hover:scale-150 opacity-0 group-hover:opacity-100" />
                <span className="relative z-10 drop-shadow-md">Y</span>
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Yoonis</h1>
            <p className="text-[11px] text-amber-500 font-mono uppercase tracking-[0.2em] font-bold">Secure Access Portal</p>
          </div>

          {/* Form Section */}
          <div className="px-10 pb-10">
            
            {/* Error Message Display */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: "auto", y: 0 }} 
                  exit={{ opacity: 0, height: 0, y: -10 }} 
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl flex items-center gap-3 shadow-lg shadow-rose-500/5">
                    <AlertCircle size={16} className="shrink-0" />
                    <span className="font-medium leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleEmailAuth} className="space-y-5">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors duration-300" size={18} />
                  <input 
                    type="email" required
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none transition-all duration-300 shadow-inner" 
                    placeholder="admin@yoonis.com" 
                  />
                </div>
              </div>

             {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Password</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="text-[10px] text-amber-500/80 hover:text-amber-400 font-bold transition-colors disabled:opacity-50 tracking-wide"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors duration-300" size={18} />
                  <input 
                    type="password" required minLength={6}
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none transition-all duration-300 shadow-inner" 
                    placeholder="••••••••" 
                  />
                </div>
                
                {/* Success Message Display */}
                <AnimatePresence>
                  {resetMsg && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg mt-3 border border-emerald-500/20 flex items-center gap-2"
                    >
                      <ShieldCheck size={14} /> {resetMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white py-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_8px_20px_rgba(217,119,6,0.2)] hover:shadow-[0_8px_25px_rgba(217,119,6,0.4)] hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 group overflow-hidden relative"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                {isLoading ? <Loader2 size={18} className="animate-spin relative z-10" /> : (
                  <span className="relative z-10 flex items-center gap-2">
                    <ShieldCheck size={18} />
                    Authenticate Session
                    <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 ease-out" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-[10px] uppercase font-bold text-neutral-600 tracking-[0.15em]">Or Continue With</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
            </div>

            {/* Google OAuth Button */}
            <button 
              type="button" onClick={handleGoogleAuth} disabled={isLoading}
              className="w-full mt-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-white py-3.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 group hover:shadow-lg"
            >
              <div className="bg-white p-1 rounded-full group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              Google Workspace
            </button>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
}