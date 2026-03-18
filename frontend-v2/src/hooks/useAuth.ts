"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { toast } from "sonner";

export function useAuth() {
  const { user, clearAuth, setAuth } = useAuthStore();
  const router = useRouter();

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuth();
      router.push("/login");
      toast.success("Logged out successfully");
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    logout,
    setAuth,
  };
}
