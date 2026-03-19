"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Eye } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useWebSocket } from "@/lib/websocket";
import { useQueryClient } from "@tanstack/react-query";
import StatusBadge from "@/components/orders/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import SkeletonTable from "../shared/SkeletonTable";

export default function OrdersTable({ onSelectOrder }: { onSelectOrder: (order: any) => void }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: orders, isLoading } = useOrders();
  const queryClient = useQueryClient();

  // Listen for WebSocket updates to refresh orders
  useWebSocket((message) => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  });

  const statuses = ["ALL", "ACTIVE", "READY", "COMPLETED", "CANCELLED"];

  if (isLoading) return <SkeletonTable rows={8} columns={7} />;

  const filteredOrders = orders?.filter(order => {
    // Status Filter
    let statusMatch = true;
    if (filter === "ACTIVE") statusMatch = [OrderStatus.CONFIRMED, OrderStatus.IN_KITCHEN].includes(order.status);
    else if (filter === "READY") statusMatch = order.status === OrderStatus.READY;
    else if (filter === "COMPLETED") statusMatch = [OrderStatus.SERVED, OrderStatus.PAID].includes(order.status);
    else if (filter === "CANCELLED") statusMatch = order.status === OrderStatus.CANCELLED;
    
    if (!statusMatch) return false;

    // Search Filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(search) ||
        order.table_number.toLowerCase().includes(search)
      );
    }

    return true;
  }) || [];

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filter === s
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search order or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full md:w-64 rounded-md border border-border bg-white pl-10 pr-4 text-xs focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4">Order #</th>
              <th className="px-6 py-4">Table</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.map((order) => (
              <tr 
                key={order.id} 
                className="table-row-hover text-xs cursor-pointer"
                onClick={() => onSelectOrder(order)}
              >
                <td className="px-6 py-4 font-bold text-gray-900">{order.order_number}</td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-600">
                    T-{order.table_number}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{order.order_items.length} items</td>
                <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(order.total_amount || 0)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status!} />
                </td>
                <td className="px-6 py-4 text-gray-500">{formatDate(order.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-brand transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
