"use client";

import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export default function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn("w-full bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-pulse", className)}>
      <div className="bg-gray-50/50 h-14 border-b border-border flex items-center px-6 space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-24" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-5 flex items-center space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  "h-3 bg-gray-100 rounded",
                  colIndex === 0 ? "w-48" : "w-24"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
