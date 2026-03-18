"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types";
import StatusBadge from "../orders/StatusBadge";
import SkeletonTable from "../shared/SkeletonTable";
import EmptyState from "../shared/EmptyState";

export default function RecentOrdersTable() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return <SkeletonTable rows={5} columns={6} />;
  
  if (!orders || orders.length === 0) {
    return <EmptyState title="No recent orders" description="Orders will appear here once they are placed." />;
  }

  // Get last 5-10 orders
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="w-full bg-white rounded-lg shadow-card border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Recent Orders</h3>
          <p className="text-xs text-gray-500">Overview of the last 10 orders placed</p>
        </div>
        <Link href="/staff/orders" className="text-xs font-bold text-brand hover:underline flex items-center">
          View all orders <ExternalLink className="ml-1 h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4">Order #</th>
              <th className="px-6 py-4">Table</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentOrders.map((order) => (
              <tr key={order.id} className="table-row-hover text-xs">
                <td className="px-6 py-4 font-bold text-gray-900">{order.order_number}</td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-600">
                    T-{order.table_number}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">
                  {order.order_items?.map(i => i.menu_item?.name).join(", ")}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(order.total_amount)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/staff/orders`} 
                    className="text-brand font-bold hover:text-brand-hover"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
