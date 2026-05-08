"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin, isSales } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
    } else if (!isLoading && user && !(isAdmin || isSales) && pathname !== "/login") {
      // User is authenticated but doesn't have admin/sales role
      router.push("/");
    }
  }, [user, isLoading, router, pathname, isAdmin, isSales]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-primary">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // If on login page, just render the content without sidebar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // If user is not authorized, don't render the layout (effect will redirect)
  if (!user || !(isAdmin || isSales)) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-primary overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <main className="p-4 md:p-8 w-full max-w-[100vw]">
          {children}
        </main>
      </div>
    </div>
  );
}
