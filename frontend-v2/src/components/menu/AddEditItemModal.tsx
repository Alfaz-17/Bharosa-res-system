"use client";

import { useState, useEffect } from "react";
import { X, Save, Image as ImageIcon, Loader2 } from "lucide-react";
import { MenuItem, MenuCategory } from "@/types";
import { toast } from "sonner";
import { useCategories, useCreateMenuItem, useUpdateMenuItem } from "@/hooks/useMenu";
import ImageUpload from "./ImageUpload";

interface AddEditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: Partial<MenuItem> | null;
}

export default function AddEditItemModal({ isOpen, onClose, item }: AddEditItemModalProps) {
  const { data: categories } = useCategories();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
    is_available: true,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        category_id: item.category?.id || "",
        image_url: item.image_url || "",
        is_available: item.is_available ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image_url: "",
        is_available: true,
      });
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      image_url: formData.image_url,
      is_available: formData.is_available,
    };

    if (item?.id) {
      updateItem.mutate({ id: item.id, ...data }, {
        onSuccess: () => {
          toast.success("Item updated successfully");
          onClose();
        }
      });
    } else {
      createItem.mutate(data, {
        onSuccess: () => {
          toast.success("Item created successfully");
          onClose();
        }
      });
    }
  };

  const isSubmitting = createItem.isPending || updateItem.isPending;

  const inputClass = "mt-1.5 w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border p-6 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
              {item ? "Edit Menu Item" : "Add New Item"}
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Fill in the details for your menu offering
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Item Name</label>
              <input
                required
                className={inputClass}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Tandoori Chicken"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} h-24 resize-none`}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the taste, ingredients, and spices..."
              />
            </div>

            <div>
              <label className={labelClass}>Price (₹)</label>
              <input
                required
                type="number"
                className={inputClass}
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="450"
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <select
                required
                className={inputClass}
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <ImageUpload 
                value={formData.image_url} 
                onChange={(url) => setFormData({ ...formData, image_url: url })} 
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-border">
              <div>
                <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Available for Order</p>
                <p className="text-[10px] text-gray-500 font-medium">Toggle this off to temporarily hide item from menu</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                   formData.is_available ? "bg-brand" : "bg-gray-200"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                   formData.is_available ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center rounded-xl bg-brand py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand/20 hover:bg-brand-hover disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? "Saving..." : "Save Menu Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
