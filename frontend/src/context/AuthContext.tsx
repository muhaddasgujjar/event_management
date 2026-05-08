"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { ROLES } from "@/lib/constants";

export interface UserObject {
  id: number;
  email: string;
  full_name: string;
  role: keyof typeof ROLES;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: UserObject | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isSales: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserObject | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodeTokenUser = (token: string): { sub?: string; role?: string } | null => {
    try {
      const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = b64 + "==".slice((b64.length + 3) % 4);
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  };

  const fetchUser = useCallback(async (attempt = 1) => {
    const storedToken = localStorage.getItem("hb_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    const { data, status } = await fetchApi<UserObject>("/api/auth/me");

    if (status === 401) {
      localStorage.removeItem("hb_token");
      setToken(null);
      setUser(null);
      setIsLoading(false);
    } else if (data) {
      setUser(data);
      setIsLoading(false);
    } else if (status === 0 && attempt === 1) {
      // Network error (cold start) — set minimal user from JWT and retry in background
      const payload = decodeTokenUser(storedToken);
      if (payload?.role) {
        setUser({ id: 0, email: payload.sub ?? "", full_name: "", role: (payload.role ?? "CLIENT") as keyof typeof ROLES, is_active: true, created_at: "" });
      }
      setIsLoading(false);
      // Retry once after 4 seconds to get full user data
      setTimeout(() => fetchUser(2), 4000);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { data, error } = await fetchApi<{ access_token: string; token_type: string }>("/api/auth/login", {
      method: "POST",
      data: { username: email, password },
      isForm: true,
    });

    if (error || !data) {
      return { error: error || "Failed to login" };
    }

    const token = data.access_token;
    localStorage.setItem("hb_token", token);
    setToken(token);

    // Immediately populate user from JWT so admin layout guard passes without waiting for /api/auth/me
    const payload = decodeTokenUser(token);
    if (payload?.role) {
      setUser({ id: 0, email: payload.sub as string ?? email, full_name: "", role: payload.role as keyof typeof ROLES, is_active: true, created_at: "" });
    }

    // Fetch full user data in background (non-blocking)
    fetchUser();
    return {};
  };

  const logout = () => {
    localStorage.removeItem("hb_token");
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === ROLES.ADMIN;
  const isSales = user?.role === ROLES.SALES;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isSales, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
