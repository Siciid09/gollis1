"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, AlertCircle, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Firebase Imports ---
import { auth, db, googleProvider } from "@/lib/firebase"; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const ROLES = ["Manager", "Master Tailor", "Cutter", "Sewer", "Finisher"];

export default function AuthPage() {
  const router = useRouter();
  
  // --- State Management ---
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Sewer", // Default role for signup
  });

  // --- Core Authentication & system Logic ---
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetMsg("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check: If a bot fills out this hidden field, block the signup silently
    if (!isLogin && honeypot) {
      setError("Invalid request detected.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResetMsg(null);

    try {
      if (isLogin) {
        // --- 1. LOGIN WORKFLOW ---
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Optional: Check if user is "accepted" before letting them in
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists() && userDoc.data().accepted === false) {
          // You could block them here, or let them into a "Pending Approval" dashboard
          console.warn("Account pending admin approval.");
        }
        
        router.push("/dash");
      } else {
        // --- 2. SIGNUP WORKFLOW ---
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Update Firebase Auth Profile
        await updateProfile(user, { displayName: formData.name });

        // Create the Firestore Document with strict parameters
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          accepted: false, // Default security posture: Not accepted yet
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });

        router.push("/dash");
      }
    } catch (err: any) {
      console.error("Auth Error Detailed:", err);
      if (err.code === "auth/invalid-credential") setError("Incorrect email or password.");
      else if (err.code === "auth/email-already-in-use") setError("An account with this email already exists.");
      else if (err.code === "auth/weak-password") setError("Password must be at least 6 characters.");
      else setError(`Authentication failed: ${err.message}`);
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

      // Check if this Google user already exists in our Firestore system
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // First time Google Login -> Create their Firestore profile
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || "Google User",
          email: user.email,
          role: "Staff", // Generic default for Google Auth
          accepted: false, // Default security posture
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        // Returning User -> Just update last login
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      }

      router.push("/dash");
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError("Google sign-in was cancelled or failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Main Glassmorphic Card */}
        <div className="bg-neutral-900/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Header Section */}
          <div className="p-8 pb-6 text-center border-b border-white/5">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
                TM
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">TailorOS</h1>
            <p className="text-xs text-neutral-400 mt-1 font-mono uppercase tracking-widest">System Matrix Authorization</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            
            {/* Toggle Login/Signup */}
            <div className="flex bg-neutral-950 border border-neutral-800 rounded-xl p-1 mb-8 relative">
              <button 
                type="button" onClick={() => { setIsLogin(true); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg z-10 transition-colors ${isLogin ? "text-white" : "text-neutral-500 hover:text-white"}`}
              >
                Sign In
              </button>
              <button 
                type="button" onClick={() => { setIsLogin(false); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg z-10 transition-colors ${!isLogin ? "text-white" : "text-neutral-500 hover:text-white"}`}
              >
                Create Account
              </button>
              
              {/* Animated Tab Background */}
              <motion.div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-neutral-800 border border-neutral-700 rounded-lg shadow-sm z-0"
                initial={false}
                animate={{ left: isLogin ? "4px" : "calc(50%)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>

            {/* Error Message Display */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }} 
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }} 
                  className="overflow-hidden"
                >
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleEmailAuth} className="space-y-4">
          
          {/* Honeypot field - invisible to humans, traps bots */}
          {!isLogin && (
            <div style={{ display: "none" }} aria-hidden="true">
              <input 
                type="text" 
                name="user_website_url_honey" 
                value={honeypot} 
                onChange={(e) => setHoneypot(e.target.value)} 
                tabIndex={-1} 
                autoComplete="off" 
              />
            </div>
          )}
              
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                    
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                          type="text" required={!isLogin}
                          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
                          placeholder="Mubarik Dev" 
                        />
                      </div>
                    </div>

                    {/* Operational Role Selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1">Operational Role</label>
                      <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <select 
                          value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all cursor-pointer"
                        >
                          {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 text-xs">▼</div>
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="email" required
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
                    placeholder="admin@tailoros.com" 
                  />
                </div>
              </div>

             {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors disabled:opacity-50"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="password" required minLength={6}
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
                    placeholder="••••••••" 
                  />
                </div>
                {/* Success Message Display */}
                {resetMsg && (
                  <p className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg mt-2 border border-emerald-500/20">
                    {resetMsg}
                  </p>
                )}
              
              </div>

              {/* Submit Button */}
              <button 
                type="submit" disabled={isLoading}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 group"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : (
                  <>
                    <ShieldCheck size={16} />
                    {isLogin ? "Authenticate" : "Initialize Account"}
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Secure OAuth</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Google OAuth Button */}
            <button 
              type="button" onClick={handleGoogleAuth} disabled={isLoading}
              className="w-full mt-6 bg-white hover:bg-neutral-200 text-neutral-900 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            
          </div>
        </div>

        {/* Security / System Note */}
        <div className="text-center mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-sm">
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
            <ShieldCheck size={12} /> Enterprise Security Protocol
          </p>
          <p className="text-[11px] text-neutral-500">
            All newly initialized accounts default to <span className="text-amber-400 font-mono">accepted: false</span>. An active System Administrator must verify and approve your clearance level before full system access is granted.
          </p>
        </div>
      </motion.div>
    </div>
  );
}