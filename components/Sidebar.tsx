"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users2,
  Ruler,
  PlusCircle,
  ClipboardList,
  PackageCheck,
  Layers,
  Truck,
  Receipt,
  TrendingUp,
  TrendingDown,
  CreditCard,
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
  LogIn,
  Menu,
  X,
  Scissors
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ThemeToggle from "@/components/ThemeToggle";

// --- Firebase Imports ---
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Utility for cleaner tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Completely Flat Menu Structure ---
type MenuItem = {
  name: string;
  icon: any;
  href: string;
  theme: {
    text: string;
    bgDefault: string;
    bgActive: string;
    bgHover: string;
    borderDefault: string;
    borderActive: string;
    borderHover: string;
    glow: string;
    indicator: string;
  };
};

const menuItems: MenuItem[] = [
  // Dashboard
  { 
    name: "Dashboard", icon: LayoutDashboard, href: "/dash",
    theme: {
      text: "text-indigo-400", bgDefault: "bg-indigo-500/5", bgActive: "bg-indigo-500/20",
      bgHover: "hover:bg-indigo-500/10", borderDefault: "border-transparent",
      borderActive: "border-indigo-500/50", borderHover: "hover:border-indigo-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]", indicator: "bg-indigo-400"
    }
  },
  // Customers
  { 
    name: "Customers", icon: Users2, href: "/customers",
    theme: {
      text: "text-emerald-400", bgDefault: "bg-emerald-500/5", bgActive: "bg-emerald-500/20",
      bgHover: "hover:bg-emerald-500/10", borderDefault: "border-transparent",
      borderActive: "border-emerald-500/50", borderHover: "hover:border-emerald-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]", indicator: "bg-emerald-400"
    }
  },
  { 
    name: "Measurements", icon: Ruler, href: "/customers/measurements",
    theme: {
      text: "text-emerald-400", bgDefault: "bg-emerald-500/5", bgActive: "bg-emerald-500/20",
      bgHover: "hover:bg-emerald-500/10", borderDefault: "border-transparent",
      borderActive: "border-emerald-500/50", borderHover: "hover:border-emerald-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]", indicator: "bg-emerald-400"
    }
  },
  // Orders
  { 
    name: "New Order", icon: PlusCircle, href: "/orders/new",
    theme: {
      text: "text-rose-400", bgDefault: "bg-rose-500/5", bgActive: "bg-rose-500/20",
      bgHover: "hover:bg-rose-500/10", borderDefault: "border-transparent",
      borderActive: "border-rose-500/50", borderHover: "hover:border-rose-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]", indicator: "bg-rose-400"
    }
  },
  { 
    name: "Order Tracking", icon: ClipboardList, href: "/orders",
    theme: {
      text: "text-rose-400", bgDefault: "bg-rose-500/5", bgActive: "bg-rose-500/20",
      bgHover: "hover:bg-rose-500/10", borderDefault: "border-transparent",
      borderActive: "border-rose-500/50", borderHover: "hover:border-rose-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]", indicator: "bg-rose-400"
    }
  },
  { 
    name: "Delivered", icon: PackageCheck, href: "/orders/delivered",
    theme: {
      text: "text-rose-400", bgDefault: "bg-rose-500/5", bgActive: "bg-rose-500/20",
      bgHover: "hover:bg-rose-500/10", borderDefault: "border-transparent",
      borderActive: "border-rose-500/50", borderHover: "hover:border-rose-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]", indicator: "bg-rose-400"
    }
  },
  // Inventory
  { 
    name: "Materials", icon: Layers, href: "/inventory",
    theme: {
      text: "text-amber-400", bgDefault: "bg-amber-500/5", bgActive: "bg-amber-500/20",
      bgHover: "hover:bg-amber-500/10", borderDefault: "border-transparent",
      borderActive: "border-amber-500/50", borderHover: "hover:border-amber-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]", indicator: "bg-amber-400"
    }
  },
  { 
    name: "Suppliers", icon: Truck, href: "/inventory/suppliers",
    theme: {
      text: "text-amber-400", bgDefault: "bg-amber-500/5", bgActive: "bg-amber-500/20",
      bgHover: "hover:bg-amber-500/10", borderDefault: "border-transparent",
      borderActive: "border-amber-500/50", borderHover: "hover:border-amber-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]", indicator: "bg-amber-400"
    }
  },
  { 
    name: "Purchases", icon: Receipt, href: "/inventory/purchases",
    theme: {
      text: "text-amber-400", bgDefault: "bg-amber-500/5", bgActive: "bg-amber-500/20",
      bgHover: "hover:bg-amber-500/10", borderDefault: "border-transparent",
      borderActive: "border-amber-500/50", borderHover: "hover:border-amber-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]", indicator: "bg-amber-400"
    }
  },
  // Finance
  { 
    name: "Income", icon: TrendingUp, href: "/finance/income",
    theme: {
      text: "text-cyan-400", bgDefault: "bg-cyan-500/5", bgActive: "bg-cyan-500/20",
      bgHover: "hover:bg-cyan-500/10", borderDefault: "border-transparent",
      borderActive: "border-cyan-500/50", borderHover: "hover:border-cyan-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]", indicator: "bg-cyan-400"
    }
  },
  { 
    name: "Expenses", icon: TrendingDown, href: "/finance/expenses",
    theme: {
      text: "text-cyan-400", bgDefault: "bg-cyan-500/5", bgActive: "bg-cyan-500/20",
      bgHover: "hover:bg-cyan-500/10", borderDefault: "border-transparent",
      borderActive: "border-cyan-500/50", borderHover: "hover:border-cyan-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]", indicator: "bg-cyan-400"
    }
  },
  { 
    name: "Payments", icon: CreditCard, href: "/finance/payments",
    theme: {
      text: "text-cyan-400", bgDefault: "bg-cyan-500/5", bgActive: "bg-cyan-500/20",
      bgHover: "hover:bg-cyan-500/10", borderDefault: "border-transparent",
      borderActive: "border-cyan-500/50", borderHover: "hover:border-cyan-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]", indicator: "bg-cyan-400"
    }
  },
  // Reports
  { 
    name: "Reports", icon: BarChart3, href: "/reports",
    theme: {
      text: "text-fuchsia-400", bgDefault: "bg-fuchsia-500/5", bgActive: "bg-fuchsia-500/20",
      bgHover: "hover:bg-fuchsia-500/10", borderDefault: "border-transparent",
      borderActive: "border-fuchsia-500/50", borderHover: "hover:border-fuchsia-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]", indicator: "bg-fuchsia-400"
    }
  },
  // Settings (Now integrated into main list)
  { 
    name: "Settings", icon: Settings, href: "/settings",
    theme: {
      text: "text-neutral-400", bgDefault: "bg-neutral-500/5", bgActive: "bg-neutral-500/20",
      bgHover: "hover:bg-neutral-500/10", borderDefault: "border-transparent",
      borderActive: "border-neutral-500/50", borderHover: "hover:border-neutral-500/30",
      glow: "drop-shadow-[0_0_8px_rgba(163,163,163,0.6)]", indicator: "bg-neutral-400"
    }
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // UI State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
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
            setUserRole("Staff");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserRole("Staff");
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
          "fixed inset-y-0 left-0 flex flex-col h-screen bg-neutral-950/90 backdrop-blur-3xl border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 shadow-[10px_0_40px_rgba(0,0,0,0.5)]",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
          "md:translate-x-0 md:relative",
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute right-4 top-5 text-neutral-400 hover:text-white hover:rotate-90 transition-transform duration-300"
        >
          <X size={18} />
        </button>

        {/* Collapse/Expand Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-7 h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-white shadow-xl hover:bg-white hover:text-black transition-all duration-300 border border-white/10 z-50 hover:scale-110"
        >
          {isCollapsed ? <ChevronRight size={12} className="ml-0.5" /> : <ChevronLeft size={12} className="mr-0.5" />}
        </button>

        {/* Brand Header - Scaled Down & Integrated Theme Toggle */}
        <div className="flex items-center justify-between h-20 border-b border-white/5 px-4">
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] relative overflow-hidden group mx-auto md:mx-0">
              <div className="absolute inset-0 bg-white/20 blur-sm group-hover:scale-150 transition-transform duration-500" />
              <span className="relative z-10"><Scissors size={16} /></span>
            </div>
            
            {(!isCollapsed || isMobileOpen) && (
              <motion.div 
                initial={{ opacity: 0, x: -5 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex flex-col truncate flex-1"
              >
                <span className="text-sm font-black text-white tracking-tight uppercase leading-none">Yoonis Tailor</span>
                <span className="text-[9px] text-amber-500 font-mono font-bold uppercase tracking-wider mt-0.5">Management System</span>
              </motion.div>
            )}
            
            {/* Theme Toggle integrated seamlessly into header */}
            {(!isCollapsed || isMobileOpen) && (
              <div className="shrink-0 ml-1">
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>

        {/* Flat Navigation Links - Smaller Cards, Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 no-scrollbar">
          <ul className="flex flex-col gap-1.5 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.name} className="flex flex-col relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      "w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] border overflow-visible",
                      isActive 
                        ? cn(item.theme.bgActive, item.theme.borderActive, "shadow-md translate-x-1") 
                        : cn(item.theme.bgDefault, item.theme.borderDefault, "text-neutral-400", item.theme.bgHover, item.theme.borderHover, "hover:text-white hover:translate-x-1.5")
                    )}
                    title={isCollapsed && !isMobileOpen ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className={cn("absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full shadow-[0_0_8px_currentColor]", item.theme.indicator)} 
                        />
                      )}
                      
                      <div className="relative">
                        <item.icon 
                          size={18} 
                          className={cn(
                            "shrink-0 transition-transform duration-300",
                            isActive ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" : item.theme.text,
                            item.theme.glow,
                            "group-hover:scale-110 group-hover:-rotate-3"
                          )} 
                        />
                      </div>
                      
                      {(!isCollapsed || isMobileOpen) && (
                        <span className={cn(
                          "truncate text-xs font-bold tracking-wide transition-colors duration-300",
                          isActive ? "text-white" : "group-hover:text-white"
                        )}>
                          {item.name}
                        </span>
                      )}
                    </div>

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && !isMobileOpen && (
                      <div className="absolute left-full ml-3 hidden rounded-lg bg-neutral-900/90 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white opacity-0 group-hover:block group-hover:opacity-100 z-50 shadow-xl whitespace-nowrap">
                        {item.name}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom User Section */}
        <div className="border-t border-white/5 p-4 flex flex-col gap-3 bg-neutral-950/50">
          
          <div className="flex items-center justify-between rounded-xl bg-black/40 p-2.5 border border-white/5 group transition-colors hover:border-white/10">
            {isAuthLoading ? (
              <div className="flex items-center justify-center w-full py-1">
                <Loader2 size={16} className="animate-spin text-neutral-500" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-3 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-white/10 text-white font-bold text-xs shadow-sm">
                    {getInitials()}
                  </div>
                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-white truncate leading-tight">
                        {user.displayName || "User"}
                      </span>
                      <span className="text-[9px] text-amber-500 font-mono truncate uppercase tracking-widest mt-0.5">
                        {userRole || "Staff"}
                      </span>
                    </div>
                  )}
                </div>
                {(!isCollapsed || isMobileOpen) && (
                  <button 
                    onClick={handleLogout}
                    className="text-neutral-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </>
            ) : (
              <button 
                onClick={() => router.push("/auth")}
                className={cn(
                  "w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all py-2 text-xs font-bold active:scale-95",
                  (isCollapsed && !isMobileOpen) ? "px-0" : "px-3"
                )}
              >
                <LogIn size={16} />
                {(!isCollapsed || isMobileOpen) && <span>Sign In</span>}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}