"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ShieldAlert, ShieldCheck, UserX, 
  UserCheck, Loader2, MoreVertical, ChevronLeft, 
  ChevronRight, Lock, Mail, Calendar, Key
} from "lucide-react";

// --- Firebase Imports ---
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

// --- TypeScript Interfaces ---
interface SystemUser {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: "Admin/Owner" | "Receptionist";
  accepted: boolean;
  createdAt: any;
  lastLogin: any;
}

export default function UsersPage() {
  // --- Security & Auth State ---
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [hasAdminClearance, setHasAdminClearance] = useState(false);

  // --- Data State ---
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- Filter & Pagination State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Active">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Active Menu State ---
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // --- 1. STRICT SECURITY GUARD ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setHasAdminClearance(false);
        setIsAuthChecking(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "Admin/Owner" && userDoc.data().accepted === true) {
          setHasAdminClearance(true);
          fetchUsers(); // Only fetch data if they are an admin
        } else {
          setHasAdminClearance(false);
        }
      } catch (error) {
        console.error("Clearance check failed:", error);
        setHasAdminClearance(false);
      } finally {
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- 2. DATA FETCHING ---
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const fetchedUsers: SystemUser[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({ id: doc.id, ...doc.data() } as SystemUser);
      });
      
      // Sort: Pending users first, then by creation date
      fetchedUsers.sort((a, b) => {
        if (a.accepted === b.accepted) return 0;
        return a.accepted ? 1 : -1;
      });
      
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch system users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. ACTIONS ---
  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setUsers(users.map(u => u.id === userId ? { ...u, accepted: !currentStatus } : u));
    setActiveMenuId(null);
    try {
      await updateDoc(doc(db, "users", userId), { accepted: !currentStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
      fetchUsers(); // Revert on failure
    }
  };

  const changeRole = async (userId: string, newRole: "Admin/Owner" | "Receptionist") => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setActiveMenuId(null);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (error) {
      console.error("Failed to update role:", error);
      fetchUsers(); 
    }
  };

  const deleteUserRecord = async (userId: string) => {
    if (!window.confirm("CRITICAL WARNING: This will permanently delete this user's profile from the database. Proceed?")) return;
    
    setUsers(users.filter(u => u.id !== userId));
    setActiveMenuId(null);
    try {
      await deleteDoc(doc(db, "users", userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
      fetchUsers();
    }
  };

  // --- 4. FILTERING & PAGINATION LOGIC ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "All" ? true : 
                            filterStatus === "Pending" ? !user.accepted : user.accepted;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentData = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  // ============================================================================
  // SECURITY RENDER: BLACK SCREEN FOR NON-ADMINS
  // ============================================================================
  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
  }

  if (!hasAdminClearance) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center select-none">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="h-24 w-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Access Denied</h1>
          <p className="text-rose-500/70 font-mono text-sm tracking-widest uppercase bg-rose-500/5 px-4 py-2 rounded-lg border border-rose-500/10 inline-block">
            Level 5 Admin Clearance Required
          </p>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // MAIN ADMIN RENDER (Optimized for Embedding)
  // ============================================================================
  return (
    <div className="text-neutral-200 relative overflow-hidden w-full">
      <div className="w-full relative z-10 space-y-6 animate-in fade-in duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Key size={14} /> Security Protocol Active
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">System Access Control</h1>
            <p className="text-sm text-neutral-400 mt-1">Manage personnel, assign roles, and grant system clearances.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Total Personnel</p>
              <p className="text-2xl font-black text-white">{users.length}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Pending Review</p>
              <p className="text-2xl font-black text-amber-400">{users.filter(u => !u.accepted).length}</p>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-2 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
          <div className="flex items-center gap-2 w-full md:w-auto p-1">
            {["All", "Pending", "Active"].map((status) => (
              <button
                key={status}
                onClick={() => { setFilterStatus(status as any); setCurrentPage(1); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status 
                    ? "bg-neutral-800 text-white shadow border border-neutral-700" 
                    : "text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {status} {status === "Pending" && users.filter(u => !u.accepted).length > 0 && `(${users.filter(u => !u.accepted).length})`}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 pr-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input 
              type="text" placeholder="Search personnel..." 
              value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none transition-all" 
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl overflow-visible min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-indigo-400"><Loader2 className="animate-spin" size={32} /></div>
          ) : currentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
              <UserX size={48} className="mb-4 opacity-50" />
              <p className="text-sm">No personnel records found matching your query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-24"> {/* Extra padding for dropdowns */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-neutral-500 bg-neutral-950/50 border-b border-white/5">
                    <th className="p-4 pl-6 font-bold">Personnel Identity</th>
                    <th className="p-4 font-bold">System Role</th>
                    <th className="p-4 font-bold">Clearance Status</th>
                    <th className="p-4 font-bold">Registration Date</th>
                    <th className="p-4 pr-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 relative">
                  {currentData.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      
                      {/* User Info */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-inner ${user.accepted ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-neutral-800 border border-neutral-700 text-neutral-500'}`}>
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-bold text-sm ${user.accepted ? 'text-white' : 'text-neutral-400'}`}>{user.name}</span>
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5"><Mail size={10}/> {user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          user.role === "Admin/Owner" 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        {user.accepted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck size={12} /> Access Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                            <ShieldAlert size={12} /> Pending Review
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <span className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
                          <Calendar size={12} className="text-neutral-600"/> {formatDate(user.createdAt)}
                        </span>
                      </td>

                      {/* Actions Dropdown */}
                      <td className="p-4 pr-6 text-right relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                          className="p-2 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-colors outline-none"
                        >
                          <MoreVertical size={16} />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === user.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-10 top-10 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left"
                            >
                              <div className="p-1 flex flex-col gap-0.5">
                                
                                {/* Toggle Access */}
                                <button onClick={() => toggleApproval(user.id, user.accepted)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors ${user.accepted ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}>
                                  {user.accepted ? <><UserX size={14} /> Revoke Clearance</> : <><UserCheck size={14} /> Grant Full Access</>}
                                </button>
                                
                                <div className="h-px bg-neutral-800 my-1 mx-2" />
                                
                                {/* Switch Role */}
                                <button onClick={() => changeRole(user.id, user.role === "Admin/Owner" ? "Receptionist" : "Admin/Owner")} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 rounded-lg transition-colors">
                                  <Key size={14} /> Make {user.role === "Admin/Owner" ? "Receptionist" : "Admin"}
                                </button>

                                {/* Delete Record */}
                                <button onClick={() => deleteUserRecord(user.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-neutral-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-colors mt-1">
                                  Delete Record
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
          )}
        </div>

        {/* Pagination Footprint */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-2 pt-2">
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-neutral-300 w-8 text-center">{currentPage}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}