"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role as Role)) {
      router.push("/staff/dashboard"); // Redirect to dashboard if role not allowed
      return;
    }

    setIsAuthorized(true);
  }, [isAuthenticated, user, allowedRoles, router, pathname, isHydrated]);

  if (!isHydrated || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Verifying Access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
