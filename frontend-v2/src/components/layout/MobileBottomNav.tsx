"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ChefHat, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/staff/dashboard",
    },
    {
      label: "Orders",
      icon: UtensilsCrossed,
      href: "/staff/orders",
    },
    {
      label: "Kitchen",
      icon: ChefHat,
      href: "/staff/kitchen",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/staff/settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white pb-safe md:hidden">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors",
                isActive ? "text-brand" : "text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 h-0.5 w-8 bg-brand rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
