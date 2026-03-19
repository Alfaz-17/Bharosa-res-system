"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AuthGuard from "@/components/auth/AuthGuard";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full bg-[#F5F6FA] overflow-hidden">
        <Sidebar aria-label="Main Sidebar" />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-10 scrollbar-hide">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
