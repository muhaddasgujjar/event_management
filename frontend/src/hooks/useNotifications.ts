"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function useNotifications() {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    const { data, error } = await fetchApi<{ unread: number }>("/api/notifications/count");
    if (!error && data) {
      setUnreadCount(data.unread);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();

    const intervalId = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(intervalId);
  }, [token, fetchUnreadCount]);

  const markAllRead = async () => {
    if (!token) return;
    const { error } = await fetchApi("/api/notifications/read-all", { method: "PUT" });
    if (!error) {
      setUnreadCount(0);
    }
  };

  return { unreadCount, markAllRead, refresh: fetchUnreadCount };
}
