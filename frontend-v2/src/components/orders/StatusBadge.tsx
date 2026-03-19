import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: "bg-gray-100 text-gray-600",
  [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-600",
  [OrderStatus.IN_KITCHEN]: "bg-yellow-100 text-yellow-700 font-bold", // Cooking
  [OrderStatus.READY]: "bg-emerald-100 text-emerald-700 font-bold",
  [OrderStatus.SERVED]: "bg-teal-100 text-teal-600",
  [OrderStatus.PAID]: "bg-emerald-500 text-white font-black",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-600",
};

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: "Created",
  [OrderStatus.CONFIRMED]: "Confirmed",
  [OrderStatus.IN_KITCHEN]: "Cooking",
  [OrderStatus.READY]: "Ready",
  [OrderStatus.SERVED]: "Served",
  [OrderStatus.PAID]: "Paid",
  [OrderStatus.CANCELLED]: "Cancelled",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "badge shrink-0 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
