import { useState } from "react";
import { Edit2, Trash2, Search, Filter } from "lucide-react";
import { useMenuItems, useUpdateMenuItem, useCategories } from "@/hooks/useMenu";
import { MenuItem } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import SkeletonTable from "../shared/SkeletonTable";
import EmptyState from "../shared/EmptyState";

export default function MenuItemsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  
  const { data: items, isLoading } = useMenuItems();
  const { data: categories } = useCategories();
  const updateItem = useUpdateMenuItem();

  const filteredItems = items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || item.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  if (isLoading) return <SkeletonTable rows={10} columns={5} />;

  if (!items || items.length === 0) {
    return <EmptyState title="No menu items found" description="Start by adding your first menu item." />;
  }

  const handleToggleAvailability = (item: MenuItem) => {
    updateItem.mutate({ id: item.id, is_available: !item.is_available });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            className="h-9 w-full md:w-80 rounded-md border border-border bg-white pl-10 pr-4 text-xs focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-border bg-white px-3 text-xs font-medium text-gray-700 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button className="flex h-9 items-center rounded-md border border-border bg-white px-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <Filter className="mr-2 h-3.5 w-3.5" /> More Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.map((item) => (
              <tr key={item.id} className="table-row-hover text-xs">
                <td className="px-6 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-border bg-surface">
                      <img
                        src={item.image_url || "/placeholder-food.png"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-[10px] text-gray-500">ID: {item.id.substring(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                    {item.category?.name}
                  </span>
                </td>
                <td className="px-6 py-3 font-bold text-gray-900">{formatCurrency(item.price || 0)}</td>
                <td className="px-6 py-3">
                  <button 
                    onClick={() => handleToggleAvailability(item)}
                    disabled={updateItem.isPending}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      item.is_available ? "bg-brand" : "bg-gray-200"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        item.is_available ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className="ml-2 text-[10px] font-bold text-gray-500 uppercase">
                    {item.is_available ? "Available" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button className="p-2 text-gray-400 hover:text-brand transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-danger transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
