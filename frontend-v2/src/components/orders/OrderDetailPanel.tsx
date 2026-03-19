import { useState, useEffect } from "react";
import { X, Printer, CheckCircle2, XCircle, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import StatusBadge from "@/components/orders/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderStatus, Role } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateOrderStatus, useOrder } from "@/hooks/useOrders";
import { useRestaurant } from "@/hooks/useRestaurant";

interface OrderDetailPanelProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailPanel({ order: initialOrder, onClose }: OrderDetailPanelProps) {
  const { user } = useAuth();
  const updateStatus = useUpdateOrderStatus();
  const [isReceiptMode, setIsReceiptMode] = useState(false);
  const [isKOTMode, setIsKOTMode] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<OrderStatus | null>(null);

  // Use useOrder for reactivity - ensures panel updates immediately on status change
  const { data: orderData } = useOrder(initialOrder?.id || "");
  const order = orderData || initialOrder;
  
  const { data: restaurant } = useRestaurant();

  // Reset optimistic status when we get fresh data or when order ID changes
  useEffect(() => {
    setOptimisticStatus(null);
  }, [orderData?.status, initialOrder?.id]);

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
        return null;
      default:
        return null;
    }
  };

  // Use optimistic status if available to compute the next button state instantly
  const effectiveStatus = optimisticStatus || order.status;
  const nextStatus = user?.role ? getNextStatus(effectiveStatus, user?.role as Role) : null;

  const handleUpdateStatus = (status: OrderStatus) => {
    setOptimisticStatus(status);
    updateStatus.mutate({ id: order.id, status });
  };

  const handlePrint = () => {
    window.print();
  };

  const isPreviewMode = isReceiptMode || isKOTMode;

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-border transition-transform animate-in slide-in-from-right duration-300 ${isPreviewMode ? 'print:relative print:w-full print:max-w-none print:shadow-none print:border-none print:inset-0' : 'print:hidden'}`}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 font-bold print:hidden">
          <div className="flex items-center space-x-3">
            {isPreviewMode ? (
               <button 
                 onClick={() => { setIsReceiptMode(false); setIsKOTMode(false); }}
                 className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
               >
                 <ArrowLeft className="h-5 w-5 mr-2" />
                 <span className="text-sm">Back</span>
               </button>
            ) : (
              <>
                <h3 className="text-lg text-gray-900">{order.order_number}</h3>
                <StatusBadge status={effectiveStatus} />
              </>
            )}
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide print:overflow-visible print:p-0 print:space-y-4">
          {isReceiptMode ? (
            /* Dedicated Receipt Layout */
            <div className="space-y-6 text-center">
              <div className="space-y-1 py-4 border-b-2 border-dashed border-gray-200">
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">{restaurant?.name || "RESTAURANT"}</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{restaurant?.address || "Address details"}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Phone: {restaurant?.phone || "+91 00000 00000"}</p>
              </div>

              <div className="flex justify-between text-left text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div>
                   <p>Bill: {order.order_number}</p>
                   <p>Date: {formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                   <p>Table: T-{order.table_number}</p>
                   <p>Waiter: {order.waiter?.name || "Staff"}</p>
                </div>
              </div>

              <div className="border-y border-gray-100 py-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {order.order_items.map((item) => (
                      <tr key={item.id} className="text-xs font-bold text-gray-900">
                        <td className="py-2">{item.menu_item.name}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 text-right border-b-2 border-dashed border-gray-200 pb-4">
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatCurrency(order.total_amount)}</span>
                 </div>
                 <div className="flex justify-between text-sm font-black text-gray-900 pt-2">
                    <span className="uppercase tracking-widest">Grand Total</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                 </div>
              </div>

              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pt-4">Thank you! Visit again.</p>
            </div>
          ) : isKOTMode ? (
            /* Dedicated KOT Layout */
            <div className="space-y-6">
              <div className="text-center py-4 border-b-2 border-dashed border-gray-300">
                <h2 className="text-xl font-black uppercase tracking-tighter">KOT - {order.table_number}</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{order.order_number} • {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex space-x-4 border-b border-gray-100 pb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white font-black">{item.quantity}</span>
                    <div>
                      <p className="text-lg font-black uppercase leading-none">{item.menu_item.name}</p>
                      {item.notes && <p className="text-sm font-bold text-gray-500 mt-1 italic italic">Note: {item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Printed by {user?.name}</p>
              </div>
            </div>
          ) : (
            /* Standard Order Detail View */
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Table Number</p>
                  <p className="text-sm font-bold text-gray-900">Table {order.table_number}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Order Placed</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
              </div>

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
                          {item.notes && <p className="text-xs text-gray-500 italic">{item.notes}</p>}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

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
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-6 space-y-3 bg-gray-50/50 print:hidden">
          {isPreviewMode ? (
            <button 
              onClick={handlePrint}
              className="flex w-full items-center justify-center rounded-xl bg-gray-900 py-4 text-sm font-black text-white shadow-xl hover:bg-black transition-all active:scale-[0.98] uppercase tracking-widest"
            >
              <Printer className="mr-2 h-5 w-5" /> Print Now
            </button>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsKOTMode(true)}
                  className="flex items-center justify-center rounded-md border border-border bg-white py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  <Printer className="mr-2 h-4 w-4" /> Print KOT
                </button>
                <button 
                  onClick={() => setIsReceiptMode(true)}
                  className="flex items-center justify-center rounded-md border border-border bg-white py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  <Printer className="mr-2 h-4 w-4" /> Bill Preview
                </button>
              </div>

              {canUpdateStatus && nextStatus && (
                <button 
                  onClick={() => handleUpdateStatus(nextStatus)}
                  disabled={updateStatus.isPending}
                  className="flex w-full items-center justify-center rounded-md bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {updateStatus.isPending ? "Updating..." : (
                    <>
                      {nextStatus === OrderStatus.CONFIRMED && "Confirm Order"}
                      {nextStatus === OrderStatus.IN_KITCHEN && "Start Cooking"}
                      {nextStatus === OrderStatus.READY && "Mark as Ready"}
                      {nextStatus === OrderStatus.SERVED && "Mark as Served"}
                    </>
                  )} 
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              )}

              {order.status === OrderStatus.SERVED && user?.role !== Role.KITCHEN && (
                <button 
                  onClick={() => window.location.href = `/staff/billing/${order.id}`}
                  className="flex w-full items-center justify-center rounded-md bg-sidebar py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-800 transition-all"
                >
                  Proceed to Billing
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              )}
              
              {order.status !== OrderStatus.PAID && order.status !== OrderStatus.CANCELLED && user?.role !== Role.KITCHEN && (
                <button 
                  onClick={() => handleUpdateStatus(OrderStatus.CANCELLED)}
                  disabled={updateStatus.isPending}
                  className="flex w-full items-center justify-center py-2 text-xs font-bold text-danger hover:underline disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
