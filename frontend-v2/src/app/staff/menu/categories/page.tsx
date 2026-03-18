"use client";

import CategoryList from "@/components/menu/CategoryList";

export default function CategoriesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Menu Categories</h1>
        <p className="text-sm text-gray-500">Organize your menu items into logical sections for easy browsing.</p>
      </div>

      <CategoryList />
      
      <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
        <h4 className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Pro Tip</h4>
        <p className="text-xs text-brand/80 leading-relaxed font-medium">
          Organize your categories by the order they should appear to the customer (e.g., Starters, Main Course, Desserts). Use the <strong className="font-black underline mx-1">drag handle</strong> to reorder them instantly!
        </p>
      </div>
    </div>
  );
}
