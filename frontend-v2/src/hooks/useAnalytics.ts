"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { AnalyticsRevenue, AnalyticsTopItem, OrderTrend, ApiResponse } from "@/types";
import { useMenuItems } from "./useMenu";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types";
import { startOfDay, endOfDay, subDays } from "date-fns";

export function useRevenueAnalytics(from: string, to: string) {
  const { user } = useAuthStore();
  const hasAccess = user && [Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN].includes(user.role as Role);

  return useQuery({
    queryKey: ["analytics", "revenue", hasAccess, from, to],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<AnalyticsRevenue>>(`/api/analytics/revenue?from=${from}&to=${to}`);
      return response.data;
    },
    enabled: !!hasAccess && !!from && !!to
  });
}

export function useTopItemsAnalytics(from: string, to: string) {
  const { user } = useAuthStore();
  const hasAccess = user && [Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN].includes(user.role as Role);
  
  return useQuery({
    queryKey: ["analytics", "top-items", hasAccess, from, to],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<AnalyticsTopItem[]>>(`/api/analytics/top-items?from=${from}&to=${to}`);
      return response.data;
    },
    enabled: !!hasAccess && !!from && !!to
  });
}

export function useOrderTrendsAnalytics(from: string, to: string) {
  const { user } = useAuthStore();
  const hasAccess = user && [Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN].includes(user.role as Role);

  return useQuery({
    queryKey: ["analytics", "order-trends", hasAccess, from, to],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<OrderTrend[]>>(`/api/analytics/order-trends?from=${from}&to=${to}`);
      return response.data;
    },
    enabled: !!hasAccess && !!from && !!to
  });
}
