"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { Loader2, ShieldCheck, UserCheck, UserX, AlertCircle } from "lucide-react";

interface SystemUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  accepted: boolean;
}

const AVAILABLE_ROLES = ["Admin/Owner", "Receptionist", "Tailor", "Staff"];

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: SystemUser[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push(doc.data() as SystemUser);
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
    setProcessingId(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { accepted: !currentStatus });
      
      // Update local UI state immediately
      setUsers(users.map(u => u.uid === userId ? { ...u, accepted: !currentStatus } : u));
    } catch (error) {
      console.error("Error updating approval status:", error);
      alert("Failed to update user access.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessingId(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      
      // Update local UI state immediately
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update role.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-indigo-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-bold text-neutral-400">Loading Access Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Access Control Matrix</h3>
        <p className="text-xs text-neutral-400">Approve or revoke system access and assign operational roles.</p>
      </div>

      <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-900/80 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Identity</th>
                <th className="px-6 py-4 font-bold">System Role</th>
                <th className="px-6 py-4 font-bold">Clearance Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{user.name}</span>
                      <span className="text-xs text-neutral-500">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                      disabled={processingId === user.uid}
                      className="bg-neutral-900 border border-neutral-700 focus:border-indigo-500 rounded-lg py-1.5 px-3 text-white text-xs outline-none cursor-pointer disabled:opacity-50"
                    >
                      {AVAILABLE_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      user.accepted ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {user.accepted ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                      {user.accepted ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleApproval(user.uid, user.accepted)}
                      disabled={processingId === user.uid}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                        user.accepted 
                          ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20" 
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {processingId === user.uid ? <Loader2 size={14} className="animate-spin" /> : (user.accepted ? <UserX size={14} /> : <UserCheck size={14} />)}
                      {user.accepted ? "Revoke Access" : "Approve User"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500 text-xs">
                    No users found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}