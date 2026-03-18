"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  QrCode,
  FileText,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FolderOpen,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  {
    label: "OVERVIEW",
    type: "header",
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/staff/dashboard",
  },
  {
    label: "OPERATIONS",
    type: "header",
  },
  {
    label: "Orders",
    icon: UtensilsCrossed,
    href: "/staff/orders",
  },
  {
    label: "Kitchen Display",
    icon: ChefHat,
    href: "/staff/kitchen",
  },
  {
    label: "Tables (QR)",
    icon: QrCode,
    href: "/staff/qr-codes",
  },
  {
    label: "MENU",
    type: "header",
  },
  {
    label: "Menu Items",
    icon: FolderOpen,
    href: "/staff/menu",
  },
  {
    label: "Categories",
    icon: FolderOpen,
    href: "/staff/menu/categories",
  },
  {
    label: "BILLING",
    type: "header",
  },
  {
    label: "Invoices",
    icon: FileText,
    href: "/staff/billing",
  },
  {
    label: "REPORTS",
    type: "header",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/staff/analytics",
  },
  {
    label: "SETTINGS",
    type: "header",
  },
  {
    label: "Users",
    icon: Users,
    href: "/staff/users",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/staff/settings",
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col bg-sidebar text-sidebar-text transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-gray-500 shadow-md hover:text-brand"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Brand Header */}
      <div className="flex h-16 items-center px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-brand text-white">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <span className="ml-3 text-lg font-bold text-white tracking-tight">
            Resto<span className="text-brand">POS</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
        <div className="space-y-1">
          {navItems.map((item, index) => {
            if (item.type === "header") {
              return !isCollapsed ? (
                <div
                  key={index}
                  className="px-3 py-2 text-[11px] font-semibold tracking-wider text-gray-500 mt-4 first:mt-0"
                >
                  {item.label}
                </div>
              ) : (
                <div key={index} className="h-px bg-gray-800 my-4" />
              );
            }

            const active = pathname === item.href;
            const Icon = item.icon!;

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white group relative",
                  active
                    ? "bg-gray-800 text-white border-l-[3px] border-brand"
                    : "text-sidebar-text"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-brand" : "group-hover:text-white"
                  )}
                />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
                
                {isCollapsed && (
                  <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Actions */}
      <div className="border-t border-gray-800 p-2">
        <div className={cn(
          "flex items-center rounded-lg p-2 transition-colors hover:bg-gray-800",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold ring-1 ring-brand/50">
            {user?.name?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold text-white">{user?.name || "Admin"}</p>
              <p className="truncate text-[10px] text-gray-500 capitalize">{user?.role?.toLowerCase() || "manager"}</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={logout}
              className="p-1 text-gray-500 hover:text-danger"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button 
            onClick={logout}
            className="flex w-full items-center justify-center p-3 text-gray-500 hover:text-danger mt-1"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
