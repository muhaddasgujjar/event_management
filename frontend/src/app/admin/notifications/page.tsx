"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Bell, Check, Info, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import NotificationsLoading from "./loading";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { markAllRead, refresh } = useNotifications();
  const { addToast } = useToast();

  const loadNotifications = async () => {
    const { data, error } = await fetchApi("/api/notifications/");
    if (data) setNotifications(data);
    else if (error) addToast(error, "error");
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
    // Mark as read when viewing the page
    const timer = setTimeout(() => {
      handleMarkAllRead();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkAllRead = async () => {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    if (unreadCount === 0) return;

    await markAllRead();
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_QUOTE": return <FileText className="w-5 h-5" />;
      case "QUOTE_APPROVED": return <CheckCircle2 className="w-5 h-5" />;
      case "ALERT": return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "NEW_QUOTE": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "QUOTE_APPROVED": return "bg-success/10 text-success border-success/20";
      case "ALERT": return "bg-danger/10 text-danger border-danger/20";
      default: return "bg-surface text-muted border-white/5";
    }
  };

  if (loading && notifications.length === 0) return <NotificationsLoading />;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Notifications</h1>
          <p className="text-muted">Stay updated on new quotes and system alerts.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={handleMarkAllRead} className="gap-2 shrink-0">
            <Check className="w-4 h-4" /> Mark All as Read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div 
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-xl border flex gap-4 transition-colors ${
                  !notification.is_read ? "bg-surface-2 border-white/10" : "bg-surface border-white/5 opacity-70"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                    <h3 className={`font-bold ${!notification.is_read ? "text-white" : "text-muted"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted whitespace-nowrap">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">{notification.message}</p>
                  
                  {notification.related_entity_id && notification.type.includes("QUOTE") && (
                    <Link href="/admin/quotes" className="text-sm text-accent hover:text-accent-light font-medium">
                      View Quote #{notification.related_entity_id}
                    </Link>
                  )}
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-16 bg-surface-2/50 rounded-2xl border border-white/5">
            <Bell className="w-12 h-12 text-muted/50 mx-auto mb-4" />
            <p className="text-muted">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
