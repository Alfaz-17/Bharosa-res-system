"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderTrend } from "@/types";

interface RevenueChartProps {
  data?: any[];
}

export default function RevenueChart({ data: propData }: RevenueChartProps) {
  const chartData = propData || [
    { date: new Date().toISOString(), order_count: 0, paid_count: 0 },
  ];

  return (
    <div className="h-[350px] w-full bg-white p-6 rounded-lg shadow-card border border-border">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Order Volume Trends</h3>
          <p className="text-xs text-gray-500">Weekly breakdown of orders vs successful payments</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="text-[9px] font-black text-brand uppercase tracking-widest">Paid</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.05} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }}
            tickFormatter={(str) => {
              try {
                return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              } catch {
                return str;
              }
            }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", fontSize: "11px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", color: "#fff" }}
            itemStyle={{ color: "#fff", fontWeight: 700 }}
            labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
            labelFormatter={(label) => {
              try {
                return new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              } catch {
                return label;
              }
            }}
          />
          <Area
            type="monotone"
            dataKey="order_count"
            name="Total Orders"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
          <Area
            type="monotone"
            dataKey="paid_count"
            name="Paid Orders"
            stroke="#F97316"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPaid)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
