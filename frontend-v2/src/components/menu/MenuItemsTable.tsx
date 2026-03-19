import { useState } from "react";
import { Edit2, Trash2, MoreHorizontal, Power } from "lucide-react";
import { useMenuItems, useUpdateMenuItem, useDeleteMenuItem, useCategories } from "@/hooks/useMenu";
import { MenuItem } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import DataTable from "../shared/DataTable";
import ConfirmDialog from "../shared/ConfirmDialog";
import { toast } from "sonner";

export default function MenuItemsTable({ onEdit }: { onEdit?: (item: MenuItem) => void }) {
  const { data: items, isLoading } = useMenuItems();
  const { data: categories } = useCategories();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleToggleAvailability = (item: MenuItem) => {
    updateItem.mutate({ id: item.id, is_available: !item.is_available });
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id, {
      onSuccess: () => setDeleteConfirm(null)
    });
  };

  const columns = [
    {
      header: "Item Info",
      accessor: (row: MenuItem) => (
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-gray-50 p-0.5">
            <img
              src={row.image_url || "/placeholder-food.png"}
              alt={row.name}
              className="h-full w-full object-cover rounded-lg"
            />
          </div>
          <div>
            <p className="font-black text-gray-900 uppercase tracking-tight">{row.name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{row.id.substring(0, 8)}</p>
          </div>
        </div>
      ),
      className: "w-[40%]"
    },
    {
      header: "Category",
      accessor: (row: MenuItem) => (
        <span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] text-gray-600 font-black uppercase tracking-wider">
          {row.category?.name || "Uncategorized"}
        </span>
      )
    },
    {
      header: "Price",
      accessor: (row: MenuItem) => (
        <span className="font-black text-gray-900">{formatCurrency(row.price || 0)}</span>
      )
    },
    {
      header: "Status",
      accessor: (row: MenuItem) => (
        <div className="flex items-center space-x-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            row.is_available ? "bg-success" : "bg-gray-300"
          )} />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            row.is_available ? "text-success" : "text-gray-400"
          )}>
            {row.is_available ? "Available" : "Hidden"}
          </span>
        </div>
      )
    },
    {
      header: "Actions",
      accessor: (row: MenuItem) => (
        <div className="flex items-center justify-end space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleToggleAvailability(row); }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-all",
              row.is_available ? "text-success hover:bg-success/5" : "text-gray-400 hover:bg-gray-50"
            )}
            title={row.is_available ? "Hide from Menu" : "Show on Menu"}
          >
            <Power className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit?.(row); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:text-brand hover:bg-brand/5 transition-all"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row.id); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:text-danger hover:bg-danger/5 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-right"
    }
  ];

  return (
    <>
      <DataTable 
        columns={columns as any}
        data={items}
        isLoading={isLoading}
        searchPlaceholder="Filter items by name, category..."
        emptyTitle="No items in menu"
        emptyDescription="Start building your restaurant menu by adding items with images and pricing."
      />

      <ConfirmDialog 
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Menu Item"
        description="Are you sure you want to remove this item? This will also remove it from any active orders it's currently in."
        confirmText="Remove Item"
        variant="danger"
        isLoading={deleteItem.isPending}
      />
    </>
  );
}
