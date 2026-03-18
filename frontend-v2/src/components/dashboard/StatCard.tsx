import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: "brand" | "info" | "success" | "warning" | "danger";
}

const colorMap = {
  brand: "border-brand bg-brand/10 text-brand",
  info: "border-info bg-info/10 text-info",
  success: "border-success bg-success/10 text-success",
  warning: "border-warning bg-warning/10 text-warning",
  danger: "border-danger bg-danger/10 text-danger",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color,
}: StatCardProps) {
  return (
    <div className={cn("stat-card", colorMap[color])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
          
          {trend && (
            <div className="mt-2 flex items-center space-x-1">
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  trend.isPositive ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
              <span className="text-[10px] text-gray-500 font-medium">vs yesterday</span>
            </div>
          )}
        </div>
        
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-full shrink-0", colorMap[color].split(" ")[1])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
