"use client";

import { X, Printer, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import StatusBadge from "@/components/orders/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Order, OrderStatus, Role } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateOrderStatus } from "@/hooks/useOrders";

interface OrderDetailPanelProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailPanel({ order, onClose }: OrderDetailPanelProps) {
  const { user } = useAuth();
  const updateStatus = useUpdateOrderStatus();
  
  if (!order) return null;

  const canUpdateStatus = [Role.ADMIN, Role.MANAGER, Role.WAITER, Role.KITCHEN].includes(user?.role as Role);

  const getNextStatus = (current: OrderStatus, userRole: Role): OrderStatus | null => {
    const isAdmin = userRole === Role.ADMIN || userRole === Role.MANAGER;

    switch (current) {
      case OrderStatus.CREATED:
        if (isAdmin || userRole === Role.WAITER) return OrderStatus.CONFIRMED;
        return null;
      case OrderStatus.CONFIRMED:
        if (isAdmin || userRole === Role.KITCHEN) return OrderStatus.IN_KITCHEN;
        return null;
      case OrderStatus.IN_KITCHEN:
        if (isAdmin || userRole === Role.KITCHEN) return OrderStatus.READY;
        return null;
      case OrderStatus.READY:
        if (isAdmin || userRole === Role.WAITER) return OrderStatus.SERVED;
        return null;
      case OrderStatus.SERVED:
        // Handled by Billing button separately
        return null;
      default:
        return null;
    }
  };

  const nextStatus = user?.role ? getNextStatus(order.status, user?.role as Role) : null;

  const handleUpdateStatus = (status: OrderStatus) => {
    updateStatus.mutate({ id: order.id, status });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-border transition-transform animate-in slide-in-from-right duration-300">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 font-bold">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg text-gray-900">{order.order_number}</h3>
            <StatusBadge status={order.status} />
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Summary Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Table Number</p>
              <p className="text-sm font-bold text-gray-900">Table {order.table_number}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Order Placed</p>
              <p className="text-sm font-bold text-gray-900 text-right">{new Date(order.created_at).toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <h4 className="border-b border-border pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">Order Items</h4>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex space-x-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-600">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.menu_item.name}</p>
                      {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(item.menu_item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="rounded-xl bg-gray-50 p-6 space-y-3">
            <div className="flex justify-between items-center text-gray-500 text-xs">
              <span>Subtotal</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-900 font-bold">
              <span>Grand Total</span>
              <span className="text-lg">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-6 space-y-3 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center rounded-md border border-border bg-white py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50">
              <Printer className="mr-2 h-4 w-4" /> Print KOT
            </button>
            <button className="flex items-center justify-center rounded-md border border-border bg-white py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50">
              <Printer className="mr-2 h-4 w-4" /> Bill Preview
            </button>
          </div>

          {canUpdateStatus && nextStatus && (
            <button 
              onClick={() => handleUpdateStatus(nextStatus)}
              disabled={updateStatus.isPending}
              className="flex w-full items-center justify-center rounded-md bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover disabled:opacity-50"
            >
              {updateStatus.isPending ? "Updating..." : `Mark as ${nextStatus.replace('_', ' ')}`} 
              <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          )}

          {order.status === OrderStatus.SERVED && (
            <button 
              onClick={() => window.location.href = `/staff/billing/${order.id}`}
              className="flex w-full items-center justify-center rounded-md bg-sidebar py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-800 transition-all"
            >
              Proceed to Billing
              <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          )}
          
          {order.status !== OrderStatus.PAID && order.status !== OrderStatus.CANCELLED && (
            <button 
              onClick={() => handleUpdateStatus(OrderStatus.CANCELLED)}
              disabled={updateStatus.isPending}
              className="flex w-full items-center justify-center py-2 text-xs font-bold text-danger hover:underline disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
