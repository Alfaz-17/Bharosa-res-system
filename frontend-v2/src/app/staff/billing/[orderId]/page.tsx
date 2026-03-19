"use client";

import InvoiceView from "@/components/billing/InvoiceView";
import { OrderStatus } from "@/types";
import { useOrder } from "@/hooks/useOrders";
import { Loader2 } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { Role } from "@/types";

export default function BillingPage({ params }: { params: { orderId: string } }) {
  const { data: order, isLoading, error } = useOrder(params.orderId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-border">
        <h2 className="text-lg font-bold text-gray-900">Order Not Found</h2>
        <p className="text-sm text-gray-500 mt-1">We couldn't find the order details for ID: {params.orderId}</p>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.WAITER]}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Checkout</h1>
          <p className="text-sm text-gray-500">Finalize order, apply discounts and collect payment from customers.</p>
        </div>
      </div>

      <InvoiceView order={order} />
    </div>
    </AuthGuard>
  );
}
