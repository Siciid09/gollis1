"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, MoreVertical, Edit2, Trash2, 
  Scissors, DollarSign, Clock, LayoutGrid, List,
  Filter, X, CheckCircle2, QrCode, Send, AlertCircle,
  Tag, Loader2, Image as ImageIcon, Ruler, UserCircle2
} from "lucide-react";
import OrderForm from "@/components/forms/OrderForm";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// --- TypeScript Interfaces ---
type OrderStatus = "Pending" | "Measuring" | "Cutting" | "Sewing" | "Fitting" | "Finishing" | "Ready" | "Delivered" | "Cancelled";

interface Order {
  id: string;
  customerName: string;
  customerId: string;
  physicalTag: string;
  garmentType: string;
  fabric: string;
  status: OrderStatus;
  total: number;
  deposit: number;
  deliveryDate: string;
  assignedTailor?: string;
  createdAt?: string;
}

const ALL_STATUSES: OrderStatus[] = ["Pending", "Measuring", "Cutting", "Sewing", "Fitting", "Finishing", "Ready", "Delivered", "Cancelled"];
const BOARD_COLUMNS: OrderStatus[] = ["Pending", "Measuring", "Cutting", "Sewing", "Fitting", "Finishing", "Ready"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // --- Dynamic Data Fetching ---
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      } else {
        console.error("API Error:", json.error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Filtering Logic ---
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(order => {
      const matchesSearch = typeof searchQuery !== "undefined" && searchQuery
        ? order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.physicalTag && order.physicalTag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
        
      const matchesStatus = typeof statusFilter !== "undefined" && statusFilter !== "All"
        ? order.status === statusFilter
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // --- KPI Calculations ---
  const activeOrdersCount = orders.filter(o => !["Delivered", "Cancelled"].includes(o.status)).length;
  const readyForPickupCount = orders.filter(o => o.status === "Ready").length;
  const totalRevenuePending = orders.filter(o => !["Delivered", "Cancelled"].includes(o.status)).reduce((sum, o) => sum + (Number(o.total) - Number(o.deposit)), 0);

  // --- Handlers ---
  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleStatusUpdate = async (id: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setActiveMenuId(null);
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error("Failed to update status in DB", error);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return; 
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    handleStatusUpdate(draggableId, destination.droppableId as OrderStatus);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this order?")) {
      setOrders(orders.filter(o => o.id !== id));
      setActiveMenuId(null);
      try {
        await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error("Failed to delete order", error);
      }
    }
  };

  // Safe placeholder handlers for Kanban card buttons
  const handleViewDesign = (order: Order) => alert(`Viewing design specs for ${order.garmentType}...`);
  const handleViewMetrics = (order: Order) => alert(`Viewing measurements for ${order.customerName}...`);

  // --- UI Components ---
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      Pending: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
      Measuring: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      Cutting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      Sewing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Fitting: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      Finishing: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      Ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Delivered: "bg-neutral-800 text-neutral-500 border-neutral-700",
      Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors[status] || colors.Pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 relative overflow-hidden">
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-1">
              <Scissors size={14} /> Production Floor
              {isLoading && <Loader2 size={12} className="animate-spin ml-2 text-indigo-500" />}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Order Matrix
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Track garment lifecycles from initial measurement to final delivery.
            </p>
          </div>
          
          <button 
            onClick={() => { setEditingOrder(undefined); setIsModalOpen(true); }} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Initialize Order
          </button>
        </header>

        {/* --- KPI Stats Matrix --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Active Workload</span>
              <h2 className="text-3xl font-black text-white mt-1">{activeOrdersCount}</h2>
            </div>
            <div className="p-3 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
              <LayoutGrid size={20} />
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Ready for Pickup</span>
              <h2 className="text-3xl font-black text-white mt-1">{readyForPickupCount}</h2>
            </div>
            <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Pending Balances</span>
              <h2 className="text-3xl font-black text-white mt-1">${totalRevenuePending.toLocaleString()}</h2>
            </div>
            <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-400">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* --- Toolbar --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0 pl-1">
            <button onClick={() => setStatusFilter("All")} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${statusFilter === "All" ? "bg-neutral-800 text-white shadow-sm border border-neutral-700" : "text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent"}`}>All Orders</button>
            {ALL_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === status ? "bg-neutral-800 text-white shadow-sm border border-neutral-700" : "text-neutral-500 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto pr-1">
            <div className="w-full md:w-72 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search ID, name, or bag tag..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 pl-9 pr-4 text-white text-sm transition-all outline-none" 
              />
            </div>
            
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 shrink-0">
              <button onClick={() => setViewMode("board")} className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold px-3 ${viewMode === "board" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}><LayoutGrid size={14} /> Board</button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold px-3 ${viewMode === "list" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}><List size={14} /> List</button>
            </div>
          </div>
        </div>

        {/* --- Data View: Kanban Board --- */}
        {viewMode === "board" && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
              {BOARD_COLUMNS.map((colStatus) => {
                const colOrders = filteredOrders.filter(o => o.status === colStatus);
                
                return (
                  <Droppable key={colStatus} droppableId={colStatus}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-w-[300px] w-[300px] flex-shrink-0 snap-start bg-neutral-900/20 rounded-2xl border transition-colors flex flex-col max-h-[750px] ${
                          snapshot.isDraggingOver ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "border-white/5"
                        }`}
                      >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-neutral-900/40 rounded-t-2xl">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={colStatus} />
                            <span className="text-xs font-bold text-neutral-500">{colOrders.length}</span>
                          </div>
                        </div>
                        
                        <div className="p-4 flex-1 overflow-y-auto space-y-4 no-scrollbar">
                          {colOrders.map((order, index) => (
                            <Draggable key={order.id} draggableId={order.id} index={index}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ ...provided.draggableProps.style }}
                                  className={`bg-neutral-950 border rounded-xl p-4 hover:border-indigo-500/40 transition-all group shadow-sm flex flex-col ${
                                    snapshot.isDragging ? "border-indigo-500 shadow-2xl scale-[1.02] z-50 rotate-1" : "border-neutral-800"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-mono font-bold text-indigo-400 text-xs">{order.id}</span>
                                    <button onClick={() => handleOpenEditModal(order)} className="text-neutral-600 hover:text-white transition-colors">
                                      <Edit2 size={12} />
                                    </button>
                                  </div>
                                  <h4 className="font-bold text-white text-sm">{order.customerName || "Unknown Client"}</h4>
                                  <div className="flex flex-col gap-2 mt-1">
                                    <span className="text-xs text-neutral-400">{order.garmentType}</span>
                                    {order.physicalTag && (
                                      <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                        <Tag size={10} /> {order.physicalTag}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                                    {order.assignedTailor ? (
                                      <div className="flex items-center gap-2">
                                         <div className="h-6 w-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400 border border-neutral-700">
                                           {order.assignedTailor.charAt(0)}
                                         </div>
                                         <span className="text-[10px] text-neutral-400 font-medium truncate w-24">{order.assignedTailor}</span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-neutral-600 italic">Unassigned</span>
                                    )}
                                    
                                    <div className="flex gap-1">
                                       <button onClick={() => handleViewDesign(order)} className="p-1.5 hover:bg-cyan-500/10 rounded text-neutral-500 hover:text-cyan-400 transition-colors" title="View Design Specs"><ImageIcon size={14}/></button>
                                       <button onClick={() => handleViewMetrics(order)} className="p-1.5 hover:bg-amber-500/10 rounded text-neutral-500 hover:text-amber-400 transition-colors" title="Verify Measurements"><Ruler size={14}/></button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          
                          {colOrders.length === 0 && !isLoading && (
                            <div className="text-center p-6 border border-dashed border-neutral-800 rounded-xl text-neutral-600 text-xs font-medium">
                              No active nodes in {colStatus}.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}

        {/* --- Data View: Table List --- */}
        {viewMode === "list" && (
          <div className="rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-xl overflow-visible relative z-0">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-neutral-400 uppercase bg-neutral-950/60 tracking-wider">
                  <tr>
                    <th className="px-6 py-5 font-bold">Order Vector</th>
                    <th className="px-6 py-5 font-bold">Client Profile</th>
                    <th className="px-6 py-5 font-bold">Blueprint & Materials</th>
                    <th className="px-6 py-5 font-bold">Target Delivery</th>
                    <th className="px-6 py-5 font-bold">Financials</th>
                    <th className="px-6 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-500 font-medium">No order vectors match your database query.</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-mono font-bold text-indigo-400 text-xs">{order.id}</span>
                            <StatusBadge status={order.status} />
                            {order.physicalTag && (
                              <span className="inline-flex items-center gap-1 w-fit mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                <Tag size={10} /> {order.physicalTag}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{order.customerName || "Unknown"}</span>
                            <span className="text-[10px] text-neutral-500 font-mono mt-0.5">{order.customerId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-neutral-200">{order.garmentType}</span>
                            <span className="text-xs text-neutral-500 mt-0.5">{order.fabric}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-neutral-300">
                            <Clock size={14} className="text-neutral-500" />
                            <span className="font-mono text-xs">{order.deliveryDate}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-white text-xs">${order.total}</span>
                            <span className="text-[10px] text-neutral-500">Paid: <span className="text-emerald-400">${order.deposit}</span></span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors focus:outline-none">
                            <MoreVertical size={18} />
                          </button>
                          
                          <AnimatePresence>
                            {activeMenuId === order.id && (
                              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.15 }} className="absolute right-8 top-10 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                                <div className="py-1">
                                  <button onClick={() => handleOpenEditModal(order)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 transition-colors text-left"><Edit2 size={14} /> Update Parameters</button>
                                  <div className="h-px bg-neutral-800 my-1" />
                                  <button onClick={() => handleStatusUpdate(order.id, "Ready")} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors text-left"><CheckCircle2 size={14} /> Mark Ready</button>
                                  <div className="h-px bg-neutral-800 my-1" />
                                  <button onClick={() => handleDelete(order.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"><Trash2 size={14} /> Void Order</button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- Global Order Form Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <div className="pointer-events-auto relative w-full max-w-2xl">
                <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 z-10 p-2 bg-neutral-900/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-full transition-colors backdrop-blur-md">
                  <X size={18} />
                </button>
                <OrderForm 
                  initialData={editingOrder as any} 
                  onSubmit={async (data) => {
                    try {
                      // Call your Firebase API to save the DB record
                      const isUpdating = !!editingOrder?.id;
                      const endpoint = isUpdating ? `/api/orders/${editingOrder.id}` : '/api/orders';
                      const method = isUpdating ? 'PATCH' : 'POST';

                      const response = await fetch(endpoint, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      });

                      if (!response.ok) throw new Error("Failed to save order");

                      // Close modal and refresh UI
                      setIsModalOpen(false);
                      fetchOrders(); 
                      
                    } catch (error) {
                      console.error("Database Error:", error);
                      alert("Failed to save the order.");
                    }
                  }} 
                  onCancel={() => setIsModalOpen(false)} 
                />
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}