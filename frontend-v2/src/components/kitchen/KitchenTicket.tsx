"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Flame } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

interface KitchenTicketProps {
  order: Partial<Order>;
}

export default function KitchenTicket({ order }: KitchenTicketProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(order.created_at || Date.now()).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerColor = (seconds: number) => {
    if (seconds < 300) return "text-white"; // < 5min
    if (seconds < 600) return "text-yellow-400"; // 5-10min
    return "text-red-500 animate-pulse"; // > 10min
  };

  const isCooking = order.status === OrderStatus.IN_KITCHEN;

  return (
    <div className="flex flex-col h-full bg-[#1E293B] rounded-lg border-2 border-slate-700 overflow-hidden shadow-xl">
      {/* Ticket Header */}
      <div className={cn(
        "p-4 flex items-center justify-between border-b-2 border-slate-700",
        isCooking ? "bg-brand/10 border-brand/30" : "bg-slate-800"
      )}>
        <div>
          <h3 className="text-2xl font-black text-white">#{order.order_number?.split("-")[1]}</h3>
          <p className="text-sm font-bold text-slate-400">TABLE {order.table_number}</p>
        </div>
        <div className={cn("flex flex-col items-end", getTimerColor(elapsed))}>
          <div className="flex items-center font-mono text-xl font-bold">
            <Clock className="mr-2 h-5 w-5" />
            {formatTime(elapsed)}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-70">Preparation Time</p>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="flex-1 p-5 overflow-y-auto scrollbar-hide">
        <ul className="space-y-4">
          {order.order_items?.map((item) => (
            <li key={item.id} className="flex items-start justify-between">
              <div className="flex space-x-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-700 text-lg font-black text-white">
                  {item.quantity}
                </span>
                <div>
                  <p className="text-xl font-bold text-white leading-tight uppercase">{item.menu_item.name}</p>
                  {item.notes && <p className="text-sm text-yellow-400/80 font-medium italic mt-1">{item.notes}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Ticket Footer */}
      <div className="p-4 bg-slate-800/50">
        {!isCooking ? (
          <button className="flex w-full items-center justify-center rounded-md bg-brand py-4 text-lg font-black text-white shadow-lg uppercase tracking-wider hover:bg-brand-hover active:scale-[0.98] transition-all">
            <Flame className="mr-3 h-6 w-6" /> Start Cooking
          </button>
        ) : (
          <button className="flex w-full items-center justify-center rounded-md bg-success py-4 text-lg font-black text-white shadow-lg uppercase tracking-wider hover:bg-success/90 active:scale-[0.98] transition-all">
            <CheckCircle2 className="mr-3 h-6 w-6" /> Mark Ready
          </button>
        )}
      </div>
    </div>
  );
}
