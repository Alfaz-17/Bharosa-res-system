"use client";

import { useState, useEffect } from "react";
import KitchenTicket from "@/components/kitchen/KitchenTicket";
import { Order, OrderStatus, Role } from "@/types";
import { Flame, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useOrders } from "@/hooks/useOrders";
import { useWebSocket } from "@/lib/websocket";
import { useQueryClient } from "@tanstack/react-query";
import AuthGuard from "@/components/auth/AuthGuard";

export default function KitchenPage() {
  const { data: orders, isLoading } = useOrders();
  const queryClient = useQueryClient();
  const [time, setTime] = useState(new Date());

  // Listen for real-time updates
  useWebSocket((message) => {
    console.log("WS Message received in KDS:", message);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  });

  // We keep track of orders that were marked as READY recently to show a "fade out" effect
  const [readyOrderIds, setReadyOrderIds] = useState<Set<string>>(new Set());

  // Filter for orders relevant to kitchen
  // We include READY orders if they just transitioned to give them time to fade out
  const kitchenOrders = orders?.filter(o => 
    o.status === OrderStatus.CREATED || 
    o.status === OrderStatus.CONFIRMED || 
    o.status === OrderStatus.IN_KITCHEN ||
    readyOrderIds.has(o.id)
  ) || [];

  // Sort orders: IN_KITCHEN first, then CONFIRMED, then CREATED
  const sortedOrders = [...kitchenOrders].sort((a, b) => {
    const score = { 
      [OrderStatus.IN_KITCHEN]: 0, 
      [OrderStatus.CONFIRMED]: 1, 
      [OrderStatus.CREATED]: 2, 
      [OrderStatus.READY]: 3 
    };
    return (score[a.status as keyof typeof score] || 99) - (score[b.status as keyof typeof score] || 99);
  });

  // Monitor status changes to handle the 3s delay for READY orders
  useEffect(() => {
    if (!orders) return;
    
    orders.forEach(order => {
      if (order.status === OrderStatus.READY && !readyOrderIds.has(order.id)) {
        // This order just became READY, let's add it to our "temporary" list
        setReadyOrderIds(prev => new Set(prev).add(order.id));
        
        // Remove it after 3 seconds
        setTimeout(() => {
          setReadyOrderIds(prev => {
            const next = new Set(prev);
            next.delete(order.id);
            return next;
          });
        }, 3000);
      }
    });
  }, [orders, readyOrderIds]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.KITCHEN]}>
      <div className="fixed inset-0 z-[60] flex flex-col bg-[#0F172A] overflow-hidden">
        {/* KDS Header */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b-4 border-slate-800 bg-[#1e293b] px-8 shadow-2xl">
          <div className="flex items-center space-x-6">
            <Link 
              href="/staff/dashboard" 
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
            </Link>
            <div className="h-8 w-px bg-slate-700" />
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-white shadow-lg shadow-brand/20">
                <Flame className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Kitchen Display</h1>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Staff Portal • Main Kitchen</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-12">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Active Tickets</span>
              <span className="text-3xl font-black text-white tabular-nums">{kitchenOrders.length}</span>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div className="flex flex-col items-end">
              <div className="flex items-center text-3xl font-black text-white tabular-nums">
                <Clock className="mr-3 h-7 w-7 text-brand" />
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Live Server Time</span>
            </div>
          </div>
        </header>

        {/* Tickets Grid */}
        <main className="flex-1 overflow-x-auto p-8 scrollbar-hide">
          <div className="flex space-x-6 h-full min-w-max pb-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-6"
                >
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-[380px] h-full bg-slate-800/50 animate-pulse rounded-lg" />
                  ))}
                </motion.div>
              ) : (
                sortedOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-[380px] h-full shrink-0"
                  >
                    <KitchenTicket order={order} />
                  </motion.div>
                ))
              )}
              
              {/* Empty placeholders to indicate more space */}
              <motion.div 
                key="placeholder"
                layout
                className="w-[380px] h-full shrink-0 flex items-center justify-center rounded-lg border-4 border-dashed border-slate-800"
              >
                <div className="text-center group">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full border-4 border-slate-800 flex items-center justify-center text-slate-800 group-hover:border-slate-700 group-hover:text-slate-700 transition-colors">
                     <PlusIcon className="h-8 w-8" />
                  </div>
                  <p className="text-slate-700 font-black tracking-widest uppercase group-hover:text-slate-600 transition-colors">Waiting for orders</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

function PlusIcon(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={3} 
      stroke="currentColor" 
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
