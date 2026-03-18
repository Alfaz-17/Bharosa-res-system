"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Order, OrderStatus, ApiResponse } from "@/types";
import { toast } from "sonner";

export function useOrders(filters?: { status?: OrderStatus; waiter_id?: string }) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.waiter_id) params.append("waiter_id", filters.waiter_id);
      
      const response = await api.get<any, ApiResponse<Order[]>>(`/api/orders?${params.toString()}`);
      return response.data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<Order>>(`/api/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: { table_number: string; notes?: string; items: any[] }) => {
      const response = await api.post<any, ApiResponse<Order>>("/api/orders", orderData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order placed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const response = await api.put<any, ApiResponse<Order>>(`/api/orders/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      toast.success(`Order status updated to ${variables.status}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
}
