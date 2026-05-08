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

  const fetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem("hb_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    const { data, error, status } = await fetchApi<UserObject>("/api/auth/me");
    
    if (error || status === 401) {
      localStorage.removeItem("hb_token");
      setToken(null);
      setUser(null);
    } else if (data) {
      setUser(data);
    }
    
    setIsLoading(false);
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

    localStorage.setItem("hb_token", data.access_token);
    setToken(data.access_token);
    await fetchUser();
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
