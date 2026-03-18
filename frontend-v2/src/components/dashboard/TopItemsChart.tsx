"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { AnalyticsTopItem } from "@/types";

interface TopItemsChartProps {
  data?: AnalyticsTopItem[];
}

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export default function TopItemsChart({ data: propData }: TopItemsChartProps) {
  const chartData = propData?.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  })) || [];
  return (
    <div className="h-[350px] w-full bg-white p-6 rounded-lg shadow-card border border-border">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900">Top 5 Menu Items</h3>
        <p className="text-xs text-gray-500">Best selling items by quantity</p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="item_name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: 600, fill: "#4b5563" }}
            width={120}
          />
          <Tooltip 
            cursor={{ fill: "transparent" }}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
          />
          <Bar dataKey="total_quantity" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
