"use client";

import { Bell, Search, Globe, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user } = useAuth();
  const { data: restaurant } = useRestaurant();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          {restaurant?.name || "RestoPOS"} 
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-2">
            Staff Portal
          </span>
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-9 w-64 rounded-md bg-surface pl-10 pr-4 text-xs font-medium border-transparent focus:border-brand/30 focus:bg-white focus:ring-0 transition-all"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-surface hover:text-brand ring-1 ring-transparent hover:ring-brand/10 transition-all">
            <Globe className="h-4 w-4" />
          </button>
          
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-surface hover:text-brand ring-1 ring-transparent hover:ring-brand/10 transition-all">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger border-2 border-white" />
          </button>
        </div>

        {/* User Chip */}
        <div className="flex items-center space-x-3 border-l border-border pl-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold ring-1 ring-brand/20">
            {user?.name?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="hidden flex-col items-start xl:flex">
            <span className="text-xs font-bold text-gray-900">{user?.name || "Admin User"}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{user?.role?.toLowerCase() || "manager"}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
