"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User, ApiResponse } from "@/types";
import { toast } from "sonner";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<User[]>>("/api/users");
      return response.data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: Partial<User> & { password?: string }) => {
      const response = await api.post<any, ApiResponse<User>>("/api/users", userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Staff member added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add staff member");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<User> & { id: string }) => {
      const response = await api.patch<any, ApiResponse<User>>(`/api/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Staff member updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update staff member");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<any, ApiResponse<void>>(`/api/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Staff member removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove staff member");
    },
  });
}
