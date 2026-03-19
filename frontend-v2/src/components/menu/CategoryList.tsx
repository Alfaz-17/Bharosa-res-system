import { useState } from "react";
import { Grab, Edit2, Trash2, Plus, X, Check, Loader2 } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useMenu";
import { MenuCategory } from "@/types";
import ConfirmDialog from "../shared/ConfirmDialog";
import { toast } from "sonner";

export default function CategoryList() {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategory.mutate({ name: newCategoryName }, {
      onSuccess: () => setNewCategoryName("")
    });
  };

  const handleStartEdit = (cat: MenuCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleUpdateCategory = () => {
    if (!editingId || !editingName.trim()) return;
    updateCategory.mutate({ id: editingId, name: editingName }, {
      onSuccess: () => setEditingId(null)
    });
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory.mutate(id, {
      onSuccess: () => setDeleteId(null)
    });
  };

  if (isLoading) return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        <div className="p-4 border-b border-border bg-gray-50/30">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Categories List</h3>
        </div>
        
        <div className="divide-y divide-border">
          {(categories || []).map((category) => (
            <div key={category.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors group">
              <div className="flex items-center space-x-4 flex-1">
                <button className="cursor-grab text-gray-300 hover:text-gray-500 transition-colors">
                  <Grab className="h-4 w-4" />
                </button>
                
                {editingId === category.id ? (
                  <div className="flex items-center space-x-2 flex-1 max-w-sm">
                    <input 
                      type="text"
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                      className="h-9 flex-1 rounded-xl border border-brand bg-white px-3 text-sm font-bold outline-none ring-4 ring-brand/5 transition-all"
                    />
                    <button 
                      onClick={handleUpdateCategory}
                      disabled={updateCategory.isPending}
                      className="h-9 w-9 flex items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all disabled:opacity-50"
                    >
                      {updateCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-white text-gray-400 hover:bg-gray-50 transition-all font-bold"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{category.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {category._count?.items || 0} items in database
                    </p>
                  </div>
                )}
              </div>
              
              {!editingId && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleStartEdit(category)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:text-brand hover:bg-brand/5 transition-all"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setDeleteId(category.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:text-danger hover:bg-danger/5 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Category Inline */}
        <div className="p-4 bg-gray-50/30 border-t border-border">
          <div className="flex space-x-3">
            <input 
              type="text" 
              placeholder="E.g. Breakfast, Main Course, Drinks..." 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              className="h-11 flex-1 rounded-2xl border border-border bg-white px-4 text-sm font-bold outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all placeholder:text-gray-300"
            />
            <button 
              onClick={handleAddCategory}
              disabled={createCategory.isPending}
              className="flex items-center rounded-2xl bg-brand px-6 py-2 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-brand/20 hover:bg-brand-hover transition-all whitespace-nowrap active:scale-[0.98] disabled:opacity-50"
            >
              {createCategory.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />} 
              {createCategory.isPending ? "Adding..." : "Add Category"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDeleteCategory(deleteId)}
        title="Delete Category"
        description="Are you sure? Removing this category will leave its items uncategorized. This action is permanent."
        confirmText="Remove Category"
        variant="danger"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
