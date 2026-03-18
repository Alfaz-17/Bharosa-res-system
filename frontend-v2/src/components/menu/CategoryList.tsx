import { useState } from "react";
import { Grab, Edit2, Trash2, Plus } from "lucide-react";
import { useCategories, useCreateCategory } from "@/hooks/useMenu";
import { MenuCategory } from "@/types";

export default function CategoryList() {
  const [newCategoryName, setNewCategoryName] = useState("");
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategory.mutate({ name: newCategoryName }, {
      onSuccess: () => setNewCategoryName("")
    });
  };

  if (isLoading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Categories List</h3>
        </div>
        
        <div className="divide-y divide-border">
          {(categories || []).map((category) => (
            <div key={category.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <button className="cursor-grab text-gray-300 hover:text-gray-500">
                  <Grab className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-sm font-bold text-gray-900">{category.name}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{category._count?.items || 0} items in this category</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button className="p-2 text-gray-400 hover:text-brand transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-danger transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Category Inline */}
        <div className="p-4 bg-gray-50/50 border-t border-border">
          <div className="flex space-x-3">
            <input 
              type="text" 
              placeholder="Enter category name..." 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              className="h-9 flex-1 rounded-md border border-border bg-white px-3 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
            <button 
              onClick={handleAddCategory}
              disabled={createCategory.isPending}
              className="flex items-center rounded-md bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-hover transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> 
              {createCategory.isPending ? "Adding..." : "Add Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
