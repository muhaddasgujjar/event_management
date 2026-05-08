"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin, isSales } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Tracks whether localStorage has a token — starts true (optimistic) to avoid
  // flashing a redirect on first render before localStorage can be read.
  const [hasStoredToken, setHasStoredToken] = useState(true);

  useEffect(() => {
    setHasStoredToken(!!localStorage.getItem("hb_token"));
  }, []);

  useEffect(() => {
    if (isLoading || hasStoredToken) return;
    // Only redirect when we are certain there is no token at all
    if (!user) {
      router.push("/login");
    } else if (!(isAdmin || isSales)) {
      router.push("/");
    }
  }, [user, isLoading, hasStoredToken, router, isAdmin, isSales]);

  // While the auth context is initializing, or while a token exists but the user
  // object hasn't been populated yet (post-login race window or cold-start), show
  // the loading spinner instead of doing a premature redirect.
  if (isLoading || (hasStoredToken && !user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-primary">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

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
