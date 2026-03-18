"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    // SaaS Flow: Redirect based on authentication status
    if (isAuthenticated) {
      router.replace("/staff/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router, isHydrated]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <p className="text-sm font-black text-gray-900 uppercase tracking-widest animate-pulse">
          Launching RestoPOS...
        </p>
      </div>
    </div>
  );
}
