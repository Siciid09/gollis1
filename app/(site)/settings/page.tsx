"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Briefcase, Bell, Users, Save, Shield, 
  Smartphone, Globe, CreditCard, Lock, Printer, 
  MessageSquare, Loader2, CheckCircle2
} from "lucide-react";
import UsersPage from "@/components/forms/UsersPage";

// --- Firebase Imports ---
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

type TabOption = "profile" | "business" | "notifications" | "team";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabOption>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Track the actual Firebase User ID and Role
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("Staff");

  // --- Real Profile State ---
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Staff" 
  });

  const [business, setBusiness] = useState({
    shopName: "",
    email: "",
    phone: "",
    address: "",
    currency: "USD",
    taxRate: "0",
    receiptFooter: "",
    logo: null
  });

  const [notifications, setNotifications] = useState({
    whatsappReady: false,
    whatsappReminders: false,
    lowStockAlerts: false,
    dailySummary: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        
        try {
          // 1. Fetch Real User Profile from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUserRole(userData.role || "Staff");
            setProfile({
              fullName: userData.name || "",
              email: userData.email || user.email || "",
              phone: userData.phone || "",
              role: userData.role || "Staff"
            });
          }

          // 2. Fetch Global Business/Notification Settings via API
          const res = await fetch('/api/settings');
          const json = await res.json();
          if (json.success && json.data) {
            if (json.data.business) setBusiness(json.data.business);
            if (json.data.notifications) setNotifications(json.data.notifications);
          }
        } catch (error) {
          console.error("Failed to load settings:", error);
        } finally {
          setIsLoadingSettings(false);
        }
      } else {
        setIsLoadingSettings(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Handlers ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save Profile Data directly to Firestore `users` collection
      if (currentUserId) {
        await updateDoc(doc(db, "users", currentUserId), {
          name: profile.fullName,
          phone: profile.phone,
        });
      }

      // 2. Save Business & Notifications to Global API
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business, notifications })
      });
      
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to sync configuration:", error);
      alert("Network Error: Could not save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Utility Component: Custom Toggle Switch ---
  const ToggleSwitch = ({ checked, onChange, label, description }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div>
        <h4 className="text-sm font-bold text-white">{label}</h4>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-neutral-800'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- Header Section --- */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Shield size={14} /> System Configuration
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Global Settings
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Manage your personal credentials, business parameters, and operational protocols.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl"
                >
                  <CheckCircle2 size={16} /> Saved
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={handleSave}
              disabled={isSaving || activeTab === "team"}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                activeTab === "team" ? "hidden" : "bg-white hover:bg-neutral-200 text-black active:scale-95 disabled:opacity-70"
              }`}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isSaving ? "Syncing..." : "Save Configuration"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- Left Sidebar Navigation --- */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: "profile", label: "Admin Profile", icon: User },
              { id: "business", label: "Business Details", icon: Briefcase },
              { id: "notifications", label: "Alerts & Webhooks", icon: Bell },
              // ONLY render the Access Control tab if the logged-in user is an Admin
              ...(currentUserRole === "Admin/Owner" ? [{ id: "team", label: "Access Control", icon: Users }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabOption)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? "bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white" 
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>

          {/* --- Right Content Area --- */}
          <div className="lg:col-span-9 bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[500px]">
            
            {isLoadingSettings ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-indigo-500">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-sm font-bold text-neutral-400 animate-pulse">Syncing Database Context...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                
                {/* === PROFILE SETTINGS === */}
                {activeTab === "profile" && (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Administrative Profile</h3>
                      <p className="text-xs text-neutral-400">Manage your credentials and identification parameters.</p>
                    </div>

                    <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-black shadow-lg shadow-indigo-500/20">
                        {profile.fullName ? profile.fullName.charAt(0) : "A"}
                      </div>
                      <div>
                        <button className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-neutral-700">
                          Upload Avatar
                        </button>
                        <p className="text-[10px] text-neutral-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Full Identity</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                          <input type="text" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
                        <div className="relative group">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                          <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Contact Vector</label>
                        <div className="relative group">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                          <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">System Role</label>
                        <div className="relative group">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                          <input type="text" disabled value={profile.role} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-neutral-500 text-sm outline-none cursor-not-allowed" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                       <h4 className="text-sm font-bold text-white">Security Validation</h4>
                       <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors">
                          <Lock size={14} /> Reset Master Password
                       </button>
                    </div>
                  </motion.div>
                )}

                {/* === BUSINESS DETAILS === */}
                {activeTab === "business" && (
                  <motion.div 
                    key="business"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    {/* Header & Database Backup Button */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Business Parameters</h3>
                        <p className="text-xs text-neutral-400">Configure global properties applied to invoices, receipts, and client portals.</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, business, notifications }, null, 2));
                          const dlAnchorElem = document.createElement('a');
                          dlAnchorElem.setAttribute("href", dataStr);
                          dlAnchorElem.setAttribute("download", `TailorSystem_Backup_${new Date().toISOString().split('T')[0]}.json`);
                          dlAnchorElem.click();
                        }} 
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/10 hover:from-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                      >
                        <Save size={14} /> Export Database Backup
                      </button>
                    </div>

                    {/* Logo Upload UI */}
                    <div className="flex items-center gap-6 pb-6 border-b border-white/5 mb-6">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500 shadow-xl overflow-hidden relative group">
                        {business.logo ? (
                          <img src={business.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Briefcase size={28} className="group-hover:scale-110 transition-transform duration-300" />
                        )}
                      </div>
                      <div>
                        <button className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-neutral-700 shadow-md">
                          Upload Shop Logo
                        </button>
                        <p className="text-[10px] text-neutral-500 mt-2">Recommended: 512x512px PNG with transparent background.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Trading Name</label>
                        <div className="relative group">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                          <input type="text" value={business.shopName} onChange={(e) => setBusiness({...business, shopName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all shadow-inner" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Business Email</label>
                        <div className="relative group">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                          <input type="email" value={business.email} onChange={(e) => setBusiness({...business, email: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all shadow-inner" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Business Phone</label>
                        <div className="relative group">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                          <input type="tel" value={business.phone} onChange={(e) => setBusiness({...business, phone: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all shadow-inner" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Base Currency</label>
                        <div className="relative group">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                          <select value={business.currency} onChange={(e) => setBusiness({...business, currency: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all">
                            <option value="USD">USD ($)</option>
                            <option value="SLSH">Somaliland Shilling (Sl.Sh)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Global Tax Rate (%)</label>
                        <input type="number" value={business.taxRate} onChange={(e) => setBusiness({...business, taxRate: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Workshop Location</label>
                        <textarea rows={2} value={business.address} onChange={(e) => setBusiness({...business, address: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-white text-sm outline-none resize-none transition-all" />
                      </div>

                      <div className="space-y-2 md:col-span-2 pt-6 border-t border-white/5">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                          <Printer size={14} /> POS Receipt Footer Text
                        </label>
                        <input type="text" value={business.receiptFooter} onChange={(e) => setBusiness({...business, receiptFooter: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all" />
                        <p className="text-[10px] text-neutral-500">This text appears at the bottom of all generated QR invoices.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* === NOTIFICATIONS & WEBHOOKS === */}
                {activeTab === "notifications" && (
                  <motion.div 
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Alerts & Messaging Hooks</h3>
                      <p className="text-xs text-neutral-400">Configure automated dispatches to clients and internal staff.</p>
                    </div>

                    <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><MessageSquare size={18} /></div>
                        <h4 className="font-bold text-white">Client WhatsApp Engine</h4>
                      </div>
                      
                      <ToggleSwitch 
                        label="Automated 'Ready for Pickup' Dispatches" 
                        description="Ping clients the second an order enters the 'Ready' pipeline state."
                        checked={notifications.whatsappReady} 
                        onChange={() => setNotifications({...notifications, whatsappReady: !notifications.whatsappReady})} 
                      />
                      <ToggleSwitch 
                        label="Pending Balance Reminders" 
                        description="Send gentle automated payment reminders 24hrs before delivery deadlines."
                        checked={notifications.whatsappReminders} 
                        onChange={() => setNotifications({...notifications, whatsappReminders: !notifications.whatsappReminders})} 
                      />
                    </div>

                    <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Bell size={18} /></div>
                        <h4 className="font-bold text-white">Internal Workshop Alerts</h4>
                      </div>
                      
                      <ToggleSwitch 
                        label="Material Depletion Alerts" 
                        description="Notify system admins when inventory items drop below their defined safety threshold."
                        checked={notifications.lowStockAlerts} 
                        onChange={() => setNotifications({...notifications, lowStockAlerts: !notifications.lowStockAlerts})} 
                      />
                      <ToggleSwitch 
                        label="Daily Executive Summary" 
                        description="Receive an evening email detailing total revenue closed and completed items."
                        checked={notifications.dailySummary} 
                        onChange={() => setNotifications({...notifications, dailySummary: !notifications.dailySummary})} 
                      />
                    </div>
                  </motion.div>
                )}

                {/* === TEAM & ACCESS (Embedded Component) === */}
                {activeTab === "team" && currentUserRole === "Admin/Owner/manager" && (
                  <motion.div 
                    key="team"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    className="w-full -mx-4 -my-4"
                  >
                    {/* Directly renders the UsersPage inside the Settings panel without routing */}
                    <UsersPage />
                  </motion.div>
                )}

              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}