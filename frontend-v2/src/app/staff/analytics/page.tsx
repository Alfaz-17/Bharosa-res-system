"use client";

import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Calendar, 
  ChevronDown, 
  TrendingUp, 
  ShoppingBag, 
  IndianRupee, 
  Star,
  Download,
  Loader2
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRevenueAnalytics, useOrderTrendsAnalytics, useTopItemsAnalytics } from "@/hooks/useAnalytics";
import { format, parseISO } from "date-fns";
import { AnalyticsRevenue, OrderTrend, AnalyticsTopItem, Role } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { Lock } from "lucide-react";
export default function AnalyticsPage() {
  const [dateRange] = useState("Last 7 Days");
  
  const { user } = useAuthStore();
  const isAdmin = user && [Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN].includes(user.role as Role);

  const { data: revenueData, isLoading: isRevLoading } = useRevenueAnalytics();
  const { data: ordersTrend, isLoading: isTrendLoading } = useOrderTrendsAnalytics();
  const { data: topItems, isLoading: isItemsLoading } = useTopItemsAnalytics();

  const isLoading = isRevLoading || isTrendLoading || isItemsLoading;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-border p-12 text-center shadow-card">
        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Access Denied</h2>
        <p className="text-sm text-gray-500 font-medium max-w-md mt-2">
          You do not have the required permissions to view financial analytics. Please contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-brand animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate Summary Stats
  const totalRevenue = revenueData?.total_revenue || 0;
  const totalOrders = ordersTrend?.reduce((sum: number, item: OrderTrend) => sum + item.order_count, 0) || 0;
  const avgOrderValue = revenueData?.average_order_value || 0;
  const bestSeller = topItems?.[0]?.item_name || "N/A";
  const bestSellerQuantity = topItems?.[0]?.total_quantity || 0;

  // Map Data for Charts
  const chartRevenueData = ordersTrend?.map(item => ({
    name: formatDate(item.date),
    revenue: item.revenue
  })) || [];

  const chartOrdersData = ordersTrend?.map(item => ({
    name: formatDate(item.date),
    orders: item.order_count
  })) || [];

  const chartTopItemsData = topItems?.map(item => ({
    name: item.item_name,
    sales: item.total_quantity
  })) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Analytics & Insight</h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide">Deep dive into your restaurant performance and trends.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center rounded-lg border border-border bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
            {dateRange}
            <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
          </button>
          <button className="flex items-center rounded-lg bg-sidebar px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-gray-800 transition-all">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: IndianRupee, color: "text-success bg-green-50/50" },
          { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag, color: "text-brand bg-orange-50/50" },
          { label: "Avg. Order Value", value: formatCurrency(avgOrderValue), icon: TrendingUp, color: "text-info bg-blue-50/50" },
          { label: "Best Seller", value: bestSeller, icon: Star, subtext: `${bestSellerQuantity} portions sold`, color: "text-warning bg-yellow-50/50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-card border border-border flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-xl font-black text-gray-900">{stat.value}</h3>
              {stat.subtext && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-xl shadow-card border border-border p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Order Trends</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Daily order volume distribution</p>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="text-[10px] font-black text-gray-500 uppercase">Orders</span>
            </div>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartOrdersData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94A3B8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94A3B8" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  labelStyle={{ fontWeight: 900, marginBottom: "4px" }}
                />
                <Area type="monotone" dataKey="orders" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-xl shadow-card border border-border p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Orders Volume</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Daily total order count</p>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-info" />
              <span className="text-[10px] font-black text-gray-500 uppercase">Orders</span>
            </div>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartOrdersData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94A3B8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94A3B8" }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items - Horizontal Bar Chart */}
        <div className="bg-white rounded-xl shadow-card border border-border p-8 lg:col-span-2">
          <div className="mb-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Top Selling Menu Items</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Portions sold in selected period</p>
          </div>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartTopItemsData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 900, fill: "#1E293B" }}
                  width={150}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px" }}
                />
                <Bar dataKey="sales" fill="#F97316" radius={[0, 6, 6, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
