"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Plus, Download, Loader2 } from "lucide-react";
import MenuItemsTable from "@/components/menu/MenuItemsTable";
import AddEditItemModal from "@/components/menu/AddEditItemModal";
import { MenuItem, Role } from "@/types";
import { downloadFile } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

import { useWebSocket } from "@/lib/websocket";
import { useQueryClient } from "@tanstack/react-query";
import AuthGuard from "@/components/auth/AuthGuard";

export default function MenuPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await api.get("/api/menu/export", { responseType: "text" });
      downloadFile(data as any, "menu_items.csv");
      toast.success("Menu exported successfully");
    } catch (error) {
      toast.error("Failed to export menu");
    } finally {
      setIsExporting(false);
    }
  };

  // Listen for real-time updates to refresh menu items
  useWebSocket(() => {
    queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
  });

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER]}>
      <div className="space-y-6">
        <PageHeader
          title="Menu Management"
          description="Manage your restaurant menu items, pricing, and availability."
          breadcrumbs={[{ label: "Menu" }, { label: "Items" }]}
          actions={
            <>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center rounded-md border border-border bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4 text-gray-400" />}
                Export Menu
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

        <MenuItemsTable onEdit={(item) => {
          setEditingItem(item);
          setIsModalOpen(true);
        }} />

        <AddEditItemModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }} 
          item={editingItem}
        />
      </div>
    </AuthGuard>
  );
}
