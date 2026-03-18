"use client";

import { useState, useEffect } from "react";
import KitchenTicket from "@/components/kitchen/KitchenTicket";
import { Order, OrderStatus } from "@/types";
import { Flame, Clock } from "lucide-react";

import { useOrders } from "@/hooks/useOrders";
import { useWebSocket } from "@/lib/websocket";
import { useQueryClient } from "@tanstack/react-query";

export default function KitchenPage() {
  const { data: orders, isLoading } = useOrders();
  const queryClient = useQueryClient();
  const [time, setTime] = useState(new Date());

  // Listen for real-time updates
  useWebSocket((message) => {
    console.log("WS Message received in KDS:", message);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  });

  // Filter for orders relevant to kitchen
  const kitchenOrders = orders?.filter(o => 
    o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.IN_KITCHEN
  ) || [];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#0F172A] overflow-hidden">
      {/* KDS Header */}
      <header className="flex h-20 shrink-0 items-center justify-between border-b-4 border-slate-800 bg-[#1e293b] px-8 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-white shadow-lg shadow-brand/20">
            <Flame className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Kitchen Display</h1>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Staff Portal • Main Kitchen</p>
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
          {isLoading ? (
            <div className="flex items-center space-x-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-[380px] h-full bg-slate-800/50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            kitchenOrders.map((order) => (
              <div key={order.id} className="w-[380px] h-full shrink-0">
                <KitchenTicket order={order} />
              </div>
            ))
          )}
          
          {/* Empty placeholders to indicate more space */}
          <div className="w-[380px] h-full shrink-0 flex items-center justify-center rounded-lg border-4 border-dashed border-slate-800">
            <div className="text-center group">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full border-4 border-slate-800 flex items-center justify-center text-slate-800 group-hover:border-slate-700 group-hover:text-slate-700 transition-colors">
                 <PlusIcon className="h-8 w-8" />
              </div>
              <p className="text-slate-700 font-black tracking-widest uppercase group-hover:text-slate-600 transition-colors">Waiting for orders</p>
            </div>
          </div>
        </div>
      </main>
    </div>
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
