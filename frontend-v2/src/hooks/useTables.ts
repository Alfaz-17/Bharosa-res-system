"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Table, ApiResponse } from "@/types";
import { toast } from "sonner";

export function useTables() {
  return useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<Table[]>>("/api/tables");
      return response.data;
    },
    meta: {
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to load tables");
      }
    }
  });
}

export function useCheckTable(tableNumber: string) {
  return useQuery({
    queryKey: ["check-table", tableNumber],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<Table>>(`/api/tables/check/${tableNumber}`);
      return response.data;
    },
    enabled: !!tableNumber,
    retry: false, // Don't retry on 404
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { table_number: string }) => {
      const response = await api.post<any, ApiResponse<Table>>("/api/tables", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create table");
    },
  });
}

export function useDeleteTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<any, ApiResponse<null>>(`/api/tables/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Table deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete table");
    },
  });
}
