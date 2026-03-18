import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: "bg-gray-100 text-gray-600",
  [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-600",
  [OrderStatus.IN_KITCHEN]: "bg-yellow-100 text-yellow-600",
  [OrderStatus.READY]: "bg-green-100 text-green-600",
  [OrderStatus.SERVED]: "bg-teal-100 text-teal-600",
  [OrderStatus.PAID]: "bg-emerald-100 text-emerald-600",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-600",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "badge shrink-0",
        statusStyles[status],
        className
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
