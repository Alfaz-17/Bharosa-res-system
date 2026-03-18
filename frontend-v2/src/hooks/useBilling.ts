"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Invoice, Payment, PaymentMethod, ApiResponse } from "@/types";
import { toast } from "sonner";

export function useInvoice(orderId: string) {
  return useQuery({
    queryKey: ["invoice", orderId],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<Invoice>>(`/api/billing/${orderId}/invoice`);
      return response.data;
    },
    enabled: !!orderId,
  });
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post<any, ApiResponse<Invoice>>(`/api/billing/${orderId}/invoice`);
      return response.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", orderId] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      toast.success("Invoice generated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to generate invoice");
    }
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, ...data }: { orderId: string; method: PaymentMethod; amount: number; reference?: string }) => {
      const response = await api.post<any, ApiResponse<Payment>>(`/api/billing/${orderId}/payments`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Payment recorded successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  });
}
