"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Flame, Loader2 } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useUpdateOrderStatus } from "@/hooks/useOrders";

interface KitchenTicketProps {
  order: Partial<Order>;
}

export default function KitchenTicket({ order }: KitchenTicketProps) {
  const [elapsed, setElapsed] = useState(0);
  const updateStatus = useUpdateOrderStatus();

  useEffect(() => {
    const start = new Date(order.created_at || Date.now()).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const handleUpdateStatus = (status: OrderStatus) => {
    if (!order.id) return;
    updateStatus.mutate({ id: order.id, status });
  };

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
  const isReady = order.status === OrderStatus.READY;
  const isUpdating = updateStatus.isPending;

  return (
    <div className={cn(
      "flex flex-col h-full bg-[#1E293B] rounded-lg border-2 overflow-hidden shadow-xl transition-all duration-1000",
      isReady ? "opacity-30 scale-95 border-success/50 translate-y-4" : "border-slate-700",
      isCooking && !isReady && "border-brand/50 shadow-brand/10"
    )}>
      {/* Ticket Header */}
      <div className={cn(
        "p-4 flex items-center justify-between border-b-2 border-slate-700 text-white",
        isReady ? "bg-success/20 border-success/30" : 
        isCooking ? "bg-yellow-400/10 border-yellow-400/30" : "bg-slate-800"
      )}>
        <div>
          <h3 className="text-2xl font-black">#{order.order_number?.split("-")[1]}</h3>
          <p className="text-sm font-bold text-slate-400">TABLE {order.table_number}</p>
        </div>
        {!isReady ? (
          <div className={cn("flex flex-col items-end", getTimerColor(elapsed))}>
            <div className="flex items-center font-mono text-xl font-bold">
              <Clock className="mr-2 h-5 w-5" />
              {formatTime(elapsed)}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-70">Preparation Time</p>
          </div>
        ) : (
          <div className="flex flex-col items-end text-success">
             <div className="flex items-center text-xl font-black">
              <CheckCircle2 className="mr-2 h-6 w-6" />
              DONE
            </div>
          </div>
        )}
      </div>

      {/* Ticket Body */}
      <div className="flex-1 p-5 overflow-y-auto scrollbar-hide">
        <ul className="space-y-4">
          {order.order_items?.map((item) => (
            <li key={item.id} className="flex items-start justify-between">
              <div className="flex space-x-4">
                <span className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded text-lg font-black text-white",
                  isReady ? "bg-success/40" : "bg-slate-700"
                )}>
                  {item.quantity}
                </span>
                <div>
                  <p className={cn(
                    "text-xl font-bold leading-tight uppercase",
                    isReady ? "text-slate-400" : "text-white"
                  )}>{item.menu_item.name}</p>
                  {item.notes && <p className="text-sm text-yellow-400/80 font-medium italic mt-1">{item.notes}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Ticket Footer */}
      <div className="p-4 bg-slate-800/50">
        {order.status === OrderStatus.CREATED ? (
          <button 
            disabled={isUpdating}
            onClick={() => handleUpdateStatus(OrderStatus.CONFIRMED)}
            className="flex w-full items-center justify-center rounded-md bg-brand/80 py-4 text-lg font-black text-white shadow-lg uppercase tracking-wider hover:bg-brand active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Flame className="mr-3 h-6 w-6" />}
            Accept Order
          </button>
        ) : order.status === OrderStatus.CONFIRMED ? (
          <button 
            disabled={isUpdating}
            onClick={() => handleUpdateStatus(OrderStatus.IN_KITCHEN)}
            className="flex w-full items-center justify-center rounded-md bg-brand py-4 text-lg font-black text-white shadow-lg uppercase tracking-wider hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Flame className="mr-3 h-6 w-6" />}
            Start Cooking
          </button>
        ) : isReady ? (
          <div className="bg-success/20 text-success text-center py-4 rounded-md font-black tracking-widest uppercase">
             Order Ready
          </div>
        ) : (
          <button 
            disabled={isUpdating}
            onClick={() => handleUpdateStatus(OrderStatus.READY)}
            className="flex w-full items-center justify-center rounded-md bg-success py-4 text-lg font-black text-white shadow-lg uppercase tracking-wider hover:bg-success/90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <CheckCircle2 className="mr-3 h-6 w-6" />}
            Mark Ready
          </button>
        )}
      </div>
    </div>
  );
}
