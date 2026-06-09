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
import { auth, db } from "@/lib/firebase"; // Ensure db is exported from your firebase config

// Utility for cleaner tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Re-architected Menu with Submenus ---
type MenuItem = {
  name: string;
  icon: any;
  href?: string;
  submenu?: { name: string; icon: any; href: string }[];
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dash" },
  { 
    name: "Customers", 
    icon: Users, 
    submenu: [
      { name: "Customer Profiles", icon: Users2, href: "/customers" },
      { name: "Measurements", icon: Ruler, href: "/customers/measurements" },
    ]
  },
  { 
    name: "Orders", 
    icon: Scissors, 
    submenu: [
      { name: "New Order", icon: PlusCircle, href: "/orders/new" },
      { name: "Order Tracking", icon: ClipboardList, href: "/orders" },
      { name: "Delivered Orders", icon: PackageCheck, href: "/orders/delivered" },
    ]
  },
  { 
    name: "Inventory", 
    icon: Box, 
    submenu: [
      { name: "Materials", icon: Layers, href: "/inventory" },
      { name: "Suppliers", icon: Truck, href: "/inventory/suppliers" },
      { name: "Purchases", icon: Receipt, href: "/inventory/purchases" },
    ]
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
    ]
  },
  { 
    name: "Reports", 
    icon: BarChart3, 
    submenu: [
      { name: "Customer Reports", icon: Users, href: "/reports/customers" },
      { name: "Order Reports", icon: Scissors, href: "/reports/orders" },
      { name: "Inventory Reports", icon: Box, href: "/reports/inventory" },
      { name: "Financial Reports", icon: Briefcase, href: "/reports" },
    ]
  },
  { name: "Notifications", icon: BellRing, href: "/notifications" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // UI State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // New mobile state
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
          // Fetch the exact role from the Firestore 'users' collection
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists() && userDocSnap.data().role) {
            setUserRole(userDocSnap.data().role);
          } else {
            setUserRole("Staff Member"); // Fallback if no document exists yet
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

  // Handle Logout
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
    if (isCollapsed) setIsCollapsed(false); // Auto-expand sidebar if trying to open a submenu
    setOpenSubmenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  return (
    <>
      {/* Mobile Floating Trigger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-neutral-900/80 backdrop-blur-md border border-white/10 text-white shadow-xl"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 flex flex-col h-screen bg-neutral-950/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out z-50 shadow-[10px_0_30px_rgba(0,0,0,0.5)]",
          // Mobile visibility
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full",
          // Desktop visibility & sizing
          "md:translate-x-0 md:relative",
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute right-4 top-6 text-neutral-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Collapse/Expand Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors border border-indigo-400/20"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Brand Header */}
        <div className="flex items-center justify-center h-24 border-b border-white/5">
          <div className="flex items-center gap-3 px-4 w-full">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xl shadow-lg shadow-indigo-600/20">
              TM
            </div>
            {/* Always show text on mobile, respect collapse state on desktop */}
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate transition-opacity duration-300">
                <span className="text-lg font-black text-white tracking-tight">Yoonis Tailor</span>
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest">System Matrix</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links with Submenu Animations */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 no-scrollbar">
          <ul className="flex flex-col gap-1.5 px-3">
            {menuItems.map((item) => {
              const isSubmenuOpen = openSubmenus[item.name];
              const hasSubmenu = !!item.submenu;
              // Check if any child route is active
              const isActive = item.href 
                ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                : item.submenu?.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`));

              return (
                <li key={item.name} className="flex flex-col">
                  <button
                    onClick={() => hasSubmenu ? toggleSubmenu(item.name) : router.push(item.href!)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                      isActive 
                        ? "bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-inner" 
                        : "text-neutral-400 hover:bg-white/5 hover:text-white font-medium border border-transparent"
                    )}
                    title={isCollapsed && !isMobileOpen ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3">
                      {isActive && !hasSubmenu && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-500 rounded-r-full" />
                      )}
                      <item.icon 
                        size={18} 
                        className={cn(
                          "shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive && "drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        )} 
                      />
                      {(!isCollapsed || isMobileOpen) && <span className="truncate text-sm tracking-wide">{item.name}</span>}
                    </div>
                    
                    {/* Submenu Dropdown Arrow */}
                    {(!isCollapsed || isMobileOpen) && hasSubmenu && (
                      <ChevronDown size={14} className={cn("transition-transform duration-300", isSubmenuOpen && "rotate-180")} />
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && !isMobileOpen && (
                      <div className="absolute left-full ml-4 hidden rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs font-bold text-white opacity-0 group-hover:block group-hover:opacity-100 z-50 shadow-xl">
                        {item.name}
                      </div>
                    )}
                  </button>

                  {/* Animated Submenu */}
                  <AnimatePresence>
                    {hasSubmenu && isSubmenuOpen && (!isCollapsed || isMobileOpen) && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden ml-4 pl-4 border-l border-white/10 mt-1 flex flex-col gap-1"
                      >
                        {item.submenu!.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                                  isSubActive 
                                    ? "text-indigo-400 font-bold bg-white/5" 
                                    : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
                                )}
                              >
                                <subItem.icon size={14} />
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

        {/* Bottom Section (Settings & Profile) */}
        <div className="border-t border-white/5 p-4 flex flex-col gap-2 bg-neutral-950/50">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition-all group border border-transparent hover:border-white/5"
          >
            <Settings size={18} className="shrink-0 group-hover:rotate-90 transition-transform duration-500 text-neutral-500 group-hover:text-white" />
            {(!isCollapsed || isMobileOpen) && <span className="text-sm font-medium tracking-wide">System Settings</span>}
          </Link>
          
          {/* User Profile / Auth Footer */}
          <div className="mt-2 flex items-center justify-between rounded-xl bg-neutral-900/80 p-2.5 border border-neutral-800 hover:border-neutral-700 transition-colors group">
            
            {isAuthLoading ? (
              <div className="flex items-center justify-center w-full py-2">
                <Loader2 size={16} className="animate-spin text-neutral-500" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-3 truncate">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-black text-sm shadow-md">
                    {getInitials()}
                  </div>
                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-white truncate">
                        {user.displayName || "Authorized User"}
                      </span>
                      {/* ACCURATE ROLE FETCHED FROM FIRESTORE */}
                      <span className="text-[10px] text-cyan-400 font-mono truncate uppercase tracking-wider mt-0.5">
                        {userRole || "Staff"}
                      </span>
                    </div>
                  )}
                </div>
                {(!isCollapsed || isMobileOpen) && (
                  <button 
                    onClick={handleLogout}
                    className="text-neutral-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                    title="Secure Logout"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </>
            ) : (
              <button 
                onClick={() => router.push("/auth")}
                className={cn(
                  "w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all py-2 text-xs font-bold active:scale-95",
                  (isCollapsed && !isMobileOpen) ? "px-0" : "px-4"
                )}
              >
                <LogIn size={16} />
                {(!isCollapsed || isMobileOpen) && <span>Sign In / Auth</span>}
              </button>
            )}

          </div>
        </div>
      </aside>
    </>
  );
}