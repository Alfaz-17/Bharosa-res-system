"use client";

import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "brand";
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "brand",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className={cn(
              "p-3 rounded-full",
              variant === "danger" ? "bg-red-50 text-red-500" : "bg-orange-50 text-brand"
            )}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{title}</h3>
          </div>
          
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <div className="bg-gray-50 p-6 flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl border border-border bg-white text-xs font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-[1.5] h-11 rounded-xl text-xs font-black text-white shadow-lg uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center",
              variant === "danger" ? "bg-red-500 shadow-red-500/20 hover:bg-red-600" : "bg-brand shadow-brand/20 hover:bg-brand-hover"
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
