import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges CSS class names correctly using clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency amount to the local currency format.
 */
export function formatCurrency(amount: number, currency: string = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date string to a human-readable format.
 */
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Truncates a string to a specified length.
 */
export function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

/**
 * Triggers a browser download for a given Blob or string.
 */
export function downloadFile(data: string | Blob, filename: string, type: string = "text/csv") {
  const blob = typeof data === "string" ? new Blob([data], { type }) : data;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
