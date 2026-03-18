"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Plus, Download } from "lucide-react";
import MenuItemsTable from "@/components/menu/MenuItemsTable";
import AddEditItemModal from "@/components/menu/AddEditItemModal";

export default function MenuPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Management"
        description="Manage your restaurant menu items, pricing, and availability."
        breadcrumbs={[{ label: "Menu" }, { label: "Items" }]}
        actions={
          <>
            <button className="flex items-center rounded-md border border-border bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              <Download className="mr-2 h-4 w-4 text-gray-400" /> Export Menu
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center rounded-md bg-brand px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </button>
          </>
        }
      />

      <MenuItemsTable />

      <AddEditItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
