"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { AnalyticsRevenue, AnalyticsTopItem, OrderTrend, ApiResponse } from "@/types";
import { useMenuItems } from "./useMenu";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types";
import { startOfDay, endOfDay, subDays } from "date-fns";

export function useRevenueAnalytics() {
  const { user } = useAuthStore();
  const hasAccess = user && [Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN].includes(user.role as Role);

  return useQuery({
    queryKey: ["analytics", "revenue", hasAccess],
    queryFn: async () => {
      const from = startOfDay(new Date()).toISOString();
      const to = endOfDay(new Date()).toISOString();
      
      const response = await api.get<any, ApiResponse<any>>(`/api/analytics/revenue?from=${from}&to=${to}`);
      const raw = response.data;
      
      // Transform Prisma aggregate to AnalyticsRevenue
      const total_revenue = Number(raw?._sum?.total || 0);
      const order_count = Number(raw?._count || 0);
      
      return {
        from,
        to,
        total_revenue,
        order_count,
        average_order_value: order_count > 0 ? total_revenue / order_count : 0
      } as AnalyticsRevenue;
    },
    enabled: !!hasAccess
  });
}

export function useTopItemsAnalytics() {
  const { data: menuItems } = useMenuItems();
  const { user } = useAuthStore();
  const hasAccess = user && [Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN].includes(user.role as Role);
  
  return useQuery({
    queryKey: ["analytics", "top-items", !!menuItems, hasAccess],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<any[]>>("/api/analytics/top-items");
      const raw = response.data;
      
      if (!menuItems) return [];

      // Join raw groupBy result with menu item details
      return raw.map(t => {
        const item = menuItems.find(m => m.id === t.menu_item_id);
        const quantity = t._sum?.quantity || 0;
        const price = item?.price || 0;
        
        return {
          item_name: item?.name || "Unknown Item",
          category_name: item?.category?.name || "Unknown Category",
          total_quantity: quantity,
          total_revenue: quantity * price
        } as AnalyticsTopItem;
      });
    },
    enabled: !!menuItems && !!hasAccess
  });
}

export function useOrderTrendsAnalytics() {
  const { user } = useAuthStore();
  const hasAccess = user && [Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN].includes(user.role as Role);

  return useQuery({
    queryKey: ["analytics", "order-trends", hasAccess],
    queryFn: async () => {
      const from = startOfDay(subDays(new Date(), 7)).toISOString();
      const to = endOfDay(new Date()).toISOString();

      const response = await api.get<any, ApiResponse<any[]>>(`/api/analytics/order-trends?from=${from}&to=${to}`);
      const raw = response.data;
      
      // Transform raw SQL result to OrderTrend
      // The original backend returns: { date, order_count, paid_count }
      return raw.map(row => ({
        date: row.date,
        order_count: row.order_count || 0,
        paid_count: row.paid_count || 0,
        revenue: 0 // Original backend trend query doesn't SUM total_amount
      })) as any[];
    },
    enabled: !!hasAccess
  });
}
