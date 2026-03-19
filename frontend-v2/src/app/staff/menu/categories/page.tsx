"use client";

import CategoryList from "@/components/menu/CategoryList";
import AuthGuard from "@/components/auth/AuthGuard";
import { Role } from "@/types";

export default function CategoriesPage() {
  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Menu Categories</h1>
          <p className="text-sm text-gray-500">Organize your menu items into logical sections for easy browsing.</p>
        </div>

        <CategoryList />
        
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
          <h4 className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Pro Tip</h4>
          <p className="text-xs text-brand/80 leading-relaxed font-medium">
            Organize your categories by logical sections (e.g., Starters, Main Course, Desserts) to help customers find their favorite dishes quickly!
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
