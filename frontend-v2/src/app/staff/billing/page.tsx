"use client";

import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/orders/StatusBadge";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderStatus, Role } from "@/types";
import { FileText, Receipt, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useWebSocket } from "@/lib/websocket";
import { useQueryClient } from "@tanstack/react-query";
import AuthGuard from "@/components/auth/AuthGuard";

export default function BillingPage() {
  const { data: orders, isLoading } = useOrders();
  const queryClient = useQueryClient();

  useWebSocket(() => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  });

  // We show orders that are SERVED or PAID in the invoices list, 
  // or maybe all orders to allow billing any confirmed order.
  const billingOrders = orders?.filter(order => 
    [OrderStatus.READY, OrderStatus.SERVED, OrderStatus.PAID].includes(order.status as OrderStatus)
  ) || [];

  const columns = [
    {
      header: "Invoice / Order #",
      accessor: (row: Order) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-border text-gray-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-gray-900 uppercase tracking-tight">{row.order_number}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(row.created_at)}</p>
          </div>
        </div>
      ),
      className: "w-[30%]"
    },
    {
      header: "Table",
      accessor: (row: Order) => (
        <span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] text-gray-600 font-black uppercase tracking-wider">
          T-{row.table_number}
        </span>
      )
    },
    {
      header: "Amount",
      accessor: (row: Order) => (
        <span className="font-black text-gray-900">{formatCurrency(row.total_amount || 0)}</span>
      )
    },
    {
      header: "Status",
      accessor: (row: Order) => (
        <StatusBadge status={row.status!} />
      )
    },
    {
      header: "Action",
      accessor: (row: Order) => (
        <Link 
          href={`/staff/billing/${row.id}`}
          className="flex items-center justify-center h-9 px-4 rounded-xl bg-gray-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand transition-all shadow-lg shadow-gray-900/10"
        >
          {row.status === OrderStatus.PAID ? "View Invoice" : "Collect Payment"}
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Link>
      ),
      className: "text-right"
    }
  ];

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.WAITER]}>
      <div className="space-y-6">
        <PageHeader 
          title="Billing & Invoices"
          description="Manage payments, generate invoices, and track revenue collection."
          breadcrumbs={[{ label: "Billing" }, { label: "Invoices" }]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Collection</p>
              <div className="h-8 w-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-500">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {billingOrders.filter(o => o.status !== OrderStatus.PAID).length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoices Generated</p>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {billingOrders.filter(o => o.status === OrderStatus.PAID).length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border bg-brand/5 border-brand/20 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Total Outstanding</p>
               <p className="text-2xl font-black text-gray-900">
                 {formatCurrency(billingOrders.filter(o => o.status !== OrderStatus.PAID).reduce((s, o) => s + (o.total_amount || 0), 0))}
               </p>
             </div>
             <Receipt className="absolute -right-4 -bottom-4 h-24 w-24 text-brand/10 rotate-12" />
          </div>
        </div>

        <DataTable 
          columns={columns as any}
          data={billingOrders}
          isLoading={isLoading}
          emptyTitle="No invoices found"
          emptyDescription="Orders will appear here once they are ready to be billed."
          searchPlaceholder="Search by order # or table..."
        />
      </div>
    </AuthGuard>
  );
}
