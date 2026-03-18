"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0", className)}>
      <div className="space-y-2">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2">
            <Link href="/dashboard" className="text-gray-400 hover:text-brand transition-colors">
              <Home className="h-3.5 w-3.5" />
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center space-x-2">
                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                {crumb.href ? (
                  <Link href={crumb.href} className="text-xs font-bold text-gray-400 hover:text-brand transition-colors uppercase tracking-widest">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs font-bold text-brand uppercase tracking-widest">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 font-medium tracking-wide">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center space-x-3">
          {actions}
        </div>
      )}
    </div>
  );
}
