"use client";

import { ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-200", className)}>
      <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
        {icon || <Search className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 font-medium max-w-xs mx-auto">
        {description}
      </p>
      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
}
