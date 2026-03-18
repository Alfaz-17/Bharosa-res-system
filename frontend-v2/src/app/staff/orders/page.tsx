"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import OrdersTable from "@/components/orders/OrdersTable";
import OrderDetailPanel from "@/components/orders/OrderDetailPanel";
import NewOrderModal from "@/components/orders/NewOrderModal";
import PageHeader from "@/components/shared/PageHeader";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders Management"
        description="Track and manage all live orders in the restaurant."
        breadcrumbs={[{ label: "Orders" }]}
        actions={
          <button 
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center rounded-md bg-brand px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> New Order
          </button>
        }
      />

      <OrdersTable onSelectOrder={setSelectedOrder} />

      <NewOrderModal 
        isOpen={isNewOrderModalOpen} 
        onClose={() => setIsNewOrderModalOpen(false)} 
      />

      {selectedOrder && (
        <OrderDetailPanel 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}
