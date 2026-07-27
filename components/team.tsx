"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, UserPlus, Mail, Phone, MapPin, 
  Briefcase, Lock, User, MoreVertical, Edit2, Trash2, 
  X, Loader2, ShieldCheck, CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Firebase Imports ---
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, getDocs, doc, getDoc, setDoc, 
  deleteDoc, serverTimestamp, query, orderBy 
} from "firebase/firestore";

// Required Roles Array
const ROLES = ["Admin", "Manager", "Finance", "Staff", "Receptionist"];

type TeamMember = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  createdAt?: any;
};

export default function TeamManagementPage() {
  const router = useRouter();
  
  // --- Access & Loading States ---
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- Data States ---
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // --- Modal & Form States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Handled carefully for admin invites
    phone: "",
    address: "",
    role: "Staff",
  });

  // --- 1. RBAC: Verify Admin Access ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "Admin") {
          setHasAccess(true);
          fetchTeamMembers();
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Access verification failed", error);
        setHasAccess(false);
      } finally {
        setIsVerifying(false);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // --- 2. Read: Fetch Team Data ---
  const fetchTeamMembers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const members: TeamMember[] = [];
      querySnapshot.forEach((doc) => {
        members.push({ uid: doc.id, ...doc.data() } as TeamMember);
      });
      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching team:", error);
    }
  };

  // --- 3. Create / Update: Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // NOTE: In a production Firebase environment, creating an Auth user via client-side 
      // logs out the current Admin. For enterprise systems, you typically send this payload 
      // to a Firebase Cloud Function to create the user securely without dropping the session.
      // Here, we simulate the database provisioning side of the CRUD operation.
      
      const uid = isEditing && selectedUid ? selectedUid : `usr_${Date.now()}`;
      
      const payload = {
        uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        updatedAt: serverTimestamp(),
      };

      if (!isEditing) {
        Object.assign(payload, { createdAt: serverTimestamp() });
        // MOCK: Cloud function call would go here to register formData.password to Firebase Auth
      }

      await setDoc(doc(db, "users", uid), payload, { merge: true });
      
      await fetchTeamMembers();
      closeModal();
    } catch (error) {
      console.error("Error saving member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. Delete: Remove Member ---
  const handleDelete = async (uid: string) => {
    if (!window.confirm("Are you sure you want to revoke this user's access and delete their profile?")) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      setTeamMembers(prev => prev.filter(m => m.uid !== uid));
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: "", email: "", password: "", phone: "", address: "", role: "Staff" });
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setIsEditing(true);
    setSelectedUid(member.uid);
    setFormData({
      name: member.name || "",
      email: member.email || "",
      password: "", // Keep blank for security, only update if typed
      phone: member.phone || "",
      address: member.address || "",
      role: member.role || "Staff",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUid(null);
  };

  // --- ACCESS DENIED UI ---
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6">
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl text-center max-w-md backdrop-blur-xl">
          <ShieldAlert className="text-rose-500 mx-auto mb-4" size={48} />
          <h1 className="text-xl font-black text-white mb-2">Clearance Level Invalid</h1>
          <p className="text-sm text-neutral-400">
            This module requires <span className="text-rose-400 font-bold">Administrator</span> privileges. Your current role does not permit access.
          </p>
          <button 
            onClick={() => router.push("/dash")}
            className="mt-6 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN ADMIN UI ---
  return (
    <div className="min-h-screen bg-[#030303] text-neutral-200 p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      
      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-amber-500" size={20} />
              <span className="text-xs text-amber-500 font-mono uppercase tracking-[0.2em] font-bold">Admin Module</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Team Management</h1>
            <p className="text-sm text-neutral-400 mt-1">Provision and manage organizational access roles.</p>
          </div>
          
          <button 
            onClick={openAddModal}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_8px_20px_rgba(217,119,6,0.2)] hover:shadow-[0_8px_25px_rgba(217,119,6,0.4)] hover:-translate-y-0.5 active:scale-[0.98] flex items-center gap-2"
          >
            <UserPlus size={18} />
            Invite Member
          </button>
        </div>

        {/* Data Table / List */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4 font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Personnel</th>
                  <th className="px-6 py-4 font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Contact Data</th>
                  <th className="px-6 py-4 font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Clearance Role</th>
                  <th className="px-6 py-4 font-bold text-neutral-400 uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {teamMembers.map((member) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={member.uid} className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-white font-bold">
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{member.name}</p>
                          <p className="text-xs text-neutral-500 font-mono">{member.uid.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <Mail size={12} className="text-neutral-500" /> {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-neutral-400 text-xs">
                          <Phone size={12} className="text-neutral-500" /> {member.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        member.role === "Admin" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        member.role === "Manager" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        member.role === "Finance" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                      }`}>
                        {member.role === "Admin" && <ShieldCheck size={12} />}
                        {member.role === "Manager" && <CheckCircle2 size={12} />}
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(member)} className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(member.uid)} className="p-2 hover:bg-rose-500/20 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {teamMembers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                      No team members found. Invite personnel to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-out / Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, x: 100, scale: 0.95 }} 
              animate={{ opacity: 1, x: 0, scale: 1 }} 
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 shadow-2xl overflow-y-auto flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20 sticky top-0 z-10 backdrop-blur-xl">
                <div>
                  <h2 className="text-xl font-black text-white">{isEditing ? "Edit Personnel" : "Invite New Member"}</h2>
                  <p className="text-xs text-amber-500 font-mono mt-1">{isEditing ? "Update clearance & data" : "Provision system access"}</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} className="text-neutral-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
                      placeholder="Jane Doe" 
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
                      placeholder="jane@yoonis.com" 
                    />
                  </div>
                </div>

                {/* Password (Only required on creation) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">
                    {isEditing ? "New Password (Leave blank to keep current)" : "Temporary Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    <input type="password" required={!isEditing} minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" 
                      placeholder="+252 XXXXXXX" 
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-[18px] text-neutral-500" size={18} />
                    <textarea rows={2} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all resize-none" 
                      placeholder="Physical location..." 
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5 pb-8">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Operational Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    <select 
                      value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-neutral-900 border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all cursor-pointer"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 text-xs">▼</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-[#0a0a0a] pt-4 pb-6 border-t border-white/5 flex gap-3 z-10">
                  <button type="button" onClick={closeModal} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl text-sm font-bold transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-600/20 flex justify-center items-center">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? "Save Changes" : "Create Account")}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}