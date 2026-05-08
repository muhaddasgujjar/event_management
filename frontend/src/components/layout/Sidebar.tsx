"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Package,
  Bell,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Home,
  Wallet,
  Images,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { UpdatePasswordModal } from "@/components/auth/UpdatePasswordModal";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Quotes", href: "/admin/quotes", icon: FileText, badge: null }, // TODO: Fetch pending count for quotes
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Equipment", href: "/admin/equipment", icon: Package },
    { name: "Portfolio", href: "/admin/portfolio", icon: Images },
    ...(isAdmin ? [
      { name: "Finance", href: "/admin/finance", icon: Wallet, badge: null },
      { name: "Users", href: "/admin/users", icon: ShieldCheck },
    ] : []),
    { name: "Notifications", href: "/admin/notifications", icon: Bell, badge: unreadCount },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface border-r border-white/5 w-64">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">H&B Admin</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <p className="text-xs text-muted truncate">{user?.full_name}</p>
          </div>
        </div>
        <div className="md:hidden">
          <button onClick={() => setMobileOpen(false)} className="text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-surface-2 text-accent border-l-2 border-accent"
                  : "text-muted hover:bg-surface-2 hover:text-accent-light border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? "text-accent" : ""}`} />
                <span className="font-medium">{link.name}</span>
              </div>
              {link.badge ? (
                <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 w-full px-4 py-3 text-muted hover:bg-surface-2 hover:text-white rounded-xl transition-colors font-medium"
        >
          <Home className="w-5 h-5" />
          <span>Back to Homepage</span>
        </Link>
        <button
          onClick={() => setPasswordModalOpen(true)}
          className="flex items-center gap-3 w-full px-4 py-3 text-muted hover:bg-surface-2 hover:text-white rounded-xl transition-colors font-medium"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Update Password</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-danger hover:bg-danger/10 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-surface border-b border-white/5 p-4 sticky top-0 z-30">
        <h2 className="font-heading text-xl font-bold text-white">H&B Admin</h2>
        <button onClick={() => setMobileOpen(true)} className="text-accent-light">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-primary/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="h-full w-64 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UpdatePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </>
  );
}
