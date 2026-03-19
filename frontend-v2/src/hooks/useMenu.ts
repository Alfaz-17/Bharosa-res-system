"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { MenuItem, MenuCategory, ApiResponse } from "@/types";
import { toast } from "sonner";

// Categories Hooks
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<MenuCategory[]>>("/api/menu/categories");
      return response.data;
    },
    meta: {
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to load categories");
      }
    }
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<MenuCategory>) => {
      const response = await api.post<any, ApiResponse<MenuCategory>>("/api/menu/categories", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MenuCategory> & { id: string }) => {
      const response = await api.put<any, ApiResponse<MenuCategory>>(`/api/menu/categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/menu/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });
}

// Menu Items Hooks
export function useMenuItems() {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<MenuItem[]>>("/api/menu/items");
      return response.data;
    },
    meta: {
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to load menu items");
      }
    }
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<MenuItem>) => {
      const response = await api.post<any, ApiResponse<MenuItem>>("/api/menu/items", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Menu item created");
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MenuItem> & { id: string }) => {
      const response = await api.put<any, ApiResponse<MenuItem>>(`/api/menu/items/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Menu item updated");
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/menu/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Menu item deleted");
    },
  });
}
