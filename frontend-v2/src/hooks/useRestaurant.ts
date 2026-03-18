"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Restaurant, ApiResponse, Role } from "@/types";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export function useRestaurant() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ["restaurant-settings"],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<Restaurant>>("/api/restaurant/settings");
      return response.data;
    },
    enabled: user?.role === Role.SUPER_ADMIN,
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Restaurant>) => {
      const response = await api.put<any, ApiResponse<Restaurant>>("/api/restaurant/settings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] });
      toast.success("Restaurant settings updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });
}
