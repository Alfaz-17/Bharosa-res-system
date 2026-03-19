"use client";

import { useCheckTable } from "@/hooks/useTables";
import { Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface TableGuardProps {
  children: React.ReactNode;
  tableNumber: string;
}

export default function TableGuard({ children, tableNumber }: TableGuardProps) {
  const { data: table, isLoading, isError, error } = useCheckTable(tableNumber);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-center p-4">
        <div>
          <Loader2 className="h-10 w-10 text-brand animate-spin mx-auto mb-4" />
          <p className="text-sm font-black uppercase tracking-widest text-gray-400">Verifying Table...</p>
        </div>
      </div>
    );
  }

  if (isError || !table) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-center p-6">
        <div className="max-w-sm w-full bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
          <div className="h-20 w-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-danger" />
          </div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Invalid Table</h2>
          <p className="mt-4 text-sm font-medium text-gray-500 leading-relaxed">
            We couldn't verify Table <span className="text-gray-900 font-bold">#{tableNumber}</span>. Please scan the QR code on your table again or ask our staff for assistance.
          </p>
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Error Code: SCAN_ERROR_404</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
