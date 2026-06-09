"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  Box, 
  CreditCard, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  BellRing,
  Loader2,
  LogIn,
  Layers,
  Briefcase,
  Menu,
  X,
  Ruler,
  PlusCircle,
  Truck,
  PackageCheck,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  PieChart,
  ClipboardList,
  Users2,
  FileText
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Firebase Imports ---
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Utility for cleaner tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Re-architected Menu with Dynamic Modern Themes ---
type MenuItem = {
  name: string;
  icon: any;
  href?: string;
  submenu?: { name: string; icon: any; href: string }[];
  theme: {
    text: string;
    bgActive: string;
    bgHover: string;
    borderActive: string;
    borderHover: string;
    glow: string;
    indicator: string;
  };
};

const menuItems: MenuItem[] = [
  { 
    name: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/dash",
    theme: {
      text: "text-indigo-400",
      bgActive: "bg-gradient-to-r from-indigo-500/20 to-purple-500/10",
      bgHover: "hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/5",
      borderActive: "border-indigo-500/30",
      borderHover: "hover:border-indigo-500/20",
      glow: "drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]",
      indicator: "bg-indigo-500"
    }
  },
  { 
    name: "Customers", 
    icon: Users, 
    submenu: [
      { name: "Customer Profiles", icon: Users2, href: "/customers" },
      { name: "Measurements", icon: Ruler, href: "/customers/measurements" },
    ],
    theme: {
      text: "text-emerald-400",
      bgActive: "bg-gradient-to-r from-emerald-500/20 to-teal-500/10",
      bgHover: "hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/5",
      borderActive: "border-emerald-500/30",
      borderHover: "hover:border-emerald-500/20",
      glow: "drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]",
      indicator: "bg-emerald-500"
    }
  },
  { 
    name: "Orders", 
    icon: Scissors, 
    submenu: [
      { name: "New Order", icon: PlusCircle, href: "/orders/new" },
      { name: "Order Tracking", icon: ClipboardList, href: "/orders" },
      { name: "Delivered Orders", icon: PackageCheck, href: "/orders/delivered" },
    ],
    theme: {
      text: "text-rose-400",
      bgActive: "bg-gradient-to-r from-rose-500/20 to-orange-500/10",
      bgHover: "hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-orange-500/5",
      borderActive: "border-rose-500/30",
      borderHover: "hover:border-rose-500/20",
      glow: "drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]",
      indicator: "bg-rose-500"
    }
  },
  { 
    name: "Inventory", 
    icon: Box, 
    submenu: [
      { name: "Materials", icon: Layers, href: "/inventory" },
      { name: "Suppliers", icon: Truck, href: "/inventory/suppliers" },
      { name: "Purchases", icon: Receipt, href: "/inventory/purchases" },
    ],
    theme: {
      text: "text-amber-400",
      bgActive: "bg-gradient-to-r from-amber-500/20 to-yellow-500/10",
      bgHover: "hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-500/5",
      borderActive: "border-amber-500/30",
      borderHover: "hover:border-amber-500/20",
      glow: "drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]",
      indicator: "bg-amber-500"
    }
  },
  { 
    name: "Finance", 
    icon: Wallet, 
    submenu: [
      { name: "Income", icon: TrendingUp, href: "/finance/income" },
      { name: "Expenses", icon: TrendingDown, href: "/finance/expenses" },
      { name: "Payments", icon: CreditCard, href: "/finance/payments" },
      { name: "Invoices", icon: FileText, href: "/finance/invoices" },
      { name: "Profit Reports", icon: PieChart, href: "/finance/profit" },
    ],
    theme: {
      text: "text-cyan-400",
      bgActive: "bg-gradient-to-r from-cyan-500/20 to-blue-500/10",
      bgHover: "hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/5",
      borderActive: "border-cyan-500/30",
      borderHover: "hover:border-cyan-500/20",
      glow: "drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]",
      indicator: "bg-cyan-500"
    }
  },
  { 
    name: "Reports", 
    icon: BarChart3, 
    submenu: [
      { name: "Customer Reports", icon: Users, href: "/reports/customers" },
      { name: "Order Reports", icon: Scissors, href: "/reports/orders" },
      { name: "Inventory Reports", icon: Box, href: "/reports/inventory" },
      { name: "Financial Reports", icon: Briefcase, href: "/reports" },
    ],
    theme: {
      text: "text-fuchsia-400",
      bgActive: "bg-gradient-to-r from-fuchsia-500/20 to-pink-500/10",
      bgHover: "hover:bg-gradient-to-r hover:from-fuchsia-500/10 hover:to-pink-500/5",
      borderActive: "border-fuchsia-500/30",
      borderHover: "hover:border-fuchsia-500/20",
      glow: "drop-shadow-[0_0_12px_rgba(217,70,239,0.6)]",
      indicator: "bg-fuchsia-500"
    }
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // UI State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  
  // Auth & DB State
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Listen to Firebase Auth state & Fetch Role from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists() && userDocSnap.data().role) {
            setUserRole(userDocSnap.data().role);
          } else {
            setUserRole("Staff Member");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserRole("Staff Member");
        }
      } else {
        setUserRole(null);
      }
      
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = () => {
    if (user?.displayName) return user.displayName.substring(0, 2).toUpperCase();
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return "US"; 
  };

  const toggleSubmenu = (menuName: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenSubmenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  return (
    <>
      {/* Mobile Floating Trigger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-neutral-900/80 backdrop-blur-md border border-white/10 text-white shadow-xl hover:scale-105 transition-transform"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 flex flex-col h-screen bg-neutral-950/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 shadow-[10px_0_40px_rgba(0,0,0,0.5)]",
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full",
          "md:translate-x-0 md:relative",
          isCollapsed ? "md:w-24" : "md:w-72"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute right-4 top-6 text-neutral-400 hover:text-white hover:rotate-90 transition-transform duration-300"
        >
          <X size={20} />
        </button>

        {/* Collapse/Expand Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-10 h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-white shadow-xl hover:bg-white hover:text-black transition-all duration-300 border border-white/10 z-50 hover:scale-110"
        >
          {isCollapsed ? <ChevronRight size={14} className="ml-0.5" /> : <ChevronLeft size={14} className="mr-0.5" />}
        </button>

        {/* Brand Header */}
        <div className="flex items-center justify-center h-28 border-b border-white/5">
          <div className="flex items-center gap-4 px-6 w-full">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 blur-md group-hover:scale-150 transition-transform duration-500" />
              <span className="relative z-10">TM</span>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex flex-col truncate"
              >
                <span className="text-xl font-black text-white tracking-tight">Yoonis Tailor</span>
                <span className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-mono font-bold uppercase tracking-widest">System Matrix</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Links with Submenu Animations */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-8 no-scrollbar">
          <ul className="flex flex-col gap-2 px-4">
            {menuItems.map((item) => {
              const isSubmenuOpen = openSubmenus[item.name];
              const hasSubmenu = !!item.submenu;
              const isActive = item.href 
                ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                : item.submenu?.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`));

              return (
                <li key={item.name} className="flex flex-col">
                  <button
                    onClick={() => hasSubmenu ? toggleSubmenu(item.name) : router.push(item.href!)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ease-out group relative border overflow-hidden",
                      isActive 
                        ? cn(item.theme.bgActive, item.theme.borderActive, "shadow-lg") 
                        : cn("border-transparent text-neutral-400", item.theme.bgHover, item.theme.borderHover, "hover:text-white hover:translate-x-1 hover:scale-[1.02] hover:shadow-xl")
                    )}
                    title={isCollapsed && !isMobileOpen ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      {isActive && !hasSubmenu && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className={cn("absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-r-full shadow-[0_0_10px_currentColor]", item.theme.indicator)} 
                        />
                      )}
                      
                      <div className="relative">
                        <item.icon 
                          size={20} 
                          className={cn(
                            "shrink-0 transition-all duration-500",
                            isActive ? item.theme.text : `group-hover:${item.theme.text}`,
                            (isActive || "group-hover:block") && item.theme.glow,
                            "group-hover:scale-110 group-hover:-rotate-3"
                          )} 
                        />
                      </div>
                      
                      {(!isCollapsed || isMobileOpen) && (
                        <span className={cn(
                          "truncate text-sm font-bold tracking-wide transition-colors duration-300",
                          isActive ? "text-white" : "group-hover:text-white"
                        )}>
                          {item.name}
                        </span>
                      )}
                    </div>
                    
                    {(!isCollapsed || isMobileOpen) && hasSubmenu && (
                      <ChevronDown size={16} className={cn("transition-transform duration-300 text-neutral-500 group-hover:text-white relative z-10", isSubmenuOpen && "rotate-180")} />
                    )}

                    {isCollapsed && !isMobileOpen && (
                      <div className="absolute left-full ml-4 hidden rounded-xl bg-neutral-900/90 backdrop-blur-md border border-white/10 px-4 py-2 text-xs font-bold text-white opacity-0 group-hover:block group-hover:opacity-100 z-50 shadow-2xl transition-all translate-y-1 group-hover:translate-y-0">
                        {item.name}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {hasSubmenu && isSubmenuOpen && (!isCollapsed || isMobileOpen) && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0, scale: 0.95 }}
                        animate={{ height: "auto", opacity: 1, scale: 1 }}
                        exit={{ height: 0, opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden ml-5 pl-5 border-l-2 border-white/5 mt-2 flex flex-col gap-1.5 origin-top"
                      >
                        {item.submenu!.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium group/sub",
                                  isSubActive 
                                    ? cn(item.theme.text, "bg-white/5 shadow-inner border border-white/5") 
                                    : "text-neutral-500 hover:text-white hover:bg-white/5 hover:translate-x-1.5 border border-transparent"
                                )}
                              >
                                <subItem.icon 
                                  size={16} 
                                  className={cn(
                                    "transition-transform duration-300 group-hover/sub:scale-110",
                                    isSubActive && item.theme.glow
                                  )} 
                                />
                                <span className="truncate">{subItem.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/5 p-5 flex flex-col gap-3 bg-gradient-to-b from-transparent to-black/40">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-neutral-400 hover:bg-white/5 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group border border-transparent hover:border-white/10"
          >
            <Settings size={20} className="shrink-0 group-hover:rotate-90 transition-transform duration-700 text-neutral-500 group-hover:text-white" />
            {(!isCollapsed || isMobileOpen) && <span className="text-sm font-bold tracking-wide">System Settings</span>}
          </Link>
          
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-neutral-900/60 backdrop-blur-md p-3 border border-white/5 hover:border-white/10 hover:shadow-xl transition-all duration-300 group">
            {isAuthLoading ? (
              <div className="flex items-center justify-center w-full py-2">
                <Loader2 size={18} className="animate-spin text-neutral-500" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-3 truncate">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-white/10 text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform duration-300">
                    {getInitials()}
                  </div>
                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex flex-col truncate transition-opacity duration-300">
                      <span className="text-sm font-bold text-white truncate">
                        {user.displayName || "Authorized User"}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono truncate uppercase tracking-widest mt-0.5 font-bold">
                        {userRole || "Staff"}
                      </span>
                    </div>
                  )}
                </div>
                {(!isCollapsed || isMobileOpen) && (
                  <button 
                    onClick={handleLogout}
                    className="text-neutral-500 hover:text-rose-400 transition-all duration-300 p-2 rounded-xl hover:bg-rose-500/10 hover:rotate-12 cursor-pointer hover:shadow-lg"
                    title="Secure Logout"
                  >
                    <LogOut size={18} />
                  </button>
                )}
              </>
            ) : (
              <button 
                onClick={() => router.push("/auth")}
                className={cn(
                  "w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 py-2.5 text-sm font-bold active:scale-95 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40",
                  (isCollapsed && !isMobileOpen) ? "px-0" : "px-4"
                )}
              >
                <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                {(!isCollapsed || isMobileOpen) && <span>Sign In</span>}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}