"use client";

import {
  IndianRupee,
  ShoppingBag,
  Timer,
  Users2,
  CalendarDays,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useRevenueAnalytics, useTopItemsAnalytics, useOrderTrendsAnalytics } from "@/hooks/useAnalytics";
import { useRestaurant } from "@/hooks/useRestaurant";
import { OrderStatus } from "@/types";
import { startOfDay, endOfDay } from "date-fns";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import TopItemsChart from "@/components/dashboard/TopItemsChart";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import OrderDetailPanel from "@/components/orders/OrderDetailPanel";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types";
import { useWebSocket } from "@/lib/websocket";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const today = new Date();
  const isoFrom = startOfDay(today).toISOString();
  const isoTo = endOfDay(today).toISOString();

  const { data: orders } = useOrders();
  const { data: revenueData } = useRevenueAnalytics(isoFrom, isoTo);
  const { data: topItems } = useTopItemsAnalytics(isoFrom, isoTo);
  const { data: trends } = useOrderTrendsAnalytics(isoFrom, isoTo);
  const { data: restaurant } = useRestaurant();
  const queryClient = useQueryClient();

  // Listen for real-time updates to refresh stats
  useWebSocket((message) => {
    console.log("WS Message received in Dashboard:", message);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  });

  const isAdmin = user && [Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN].includes(user.role as Role);

  // Calculate real-time stats
  const todayRevenue = revenueData?.total_revenue || 0;
  const activeOrders = orders?.filter(o => ![OrderStatus.PAID, OrderStatus.CANCELLED].includes(o.status as OrderStatus)) || [];
  const activeOrdersCount = activeOrders.length;
  const totalOrdersToday = orders?.length || 0;
  const uniqueTables = new Set(activeOrders.map(o => o.table_number)).size;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{restaurant?.name || "Staff"} Overview</h1>
          <p className="text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-border shadow-sm">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-700">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <StatCard
            label="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            icon={IndianRupee}
            color="success"
          />
        )}
        <StatCard
          label="Total Orders"
          value={totalOrdersToday.toString()}
          icon={ShoppingBag}
          color="brand"
        />
        <StatCard
          label="Active Orders"
          value={activeOrdersCount.toString()}
          icon={Timer}
          color="info"
        />
        <StatCard
          label="Tables Occupied"
          value={`${uniqueTables} Tables`}
          icon={Users2}
          color="warning"
        />
      </div>

      {/* Charts Row */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueChart data={trends} />
          <TopItemsChart data={topItems} />
        </div>
      )}

      {/* Recent Activity */}
      <RecentOrdersTable onSelectOrder={setSelectedOrder} />

      {selectedOrder && (
        <OrderDetailPanel 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}
