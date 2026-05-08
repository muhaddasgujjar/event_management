"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { fetchApi } from "@/lib/api";
import { UpdatePasswordModal } from "@/components/auth/UpdatePasswordModal";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isSales } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const isHomepage = pathname === "/";
  const isAdminRoute = pathname.startsWith("/admin");

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const fetchRecentNotifications = async () => {
    const { data } = await fetchApi("/api/notifications/");
    if (data) setNotifications(data);
  };

  useEffect(() => {
    if (notificationsOpen) {
      fetchRecentNotifications();
    }
  }, [notificationsOpen]);

  // Don't render public navbar on admin routes (except maybe login, but usually admin has its own layout)
  if (isAdminRoute) return null;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "AI Advisor", href: "/advisor", highlight: true },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
          isScrolled || !isHomepage || mobileMenuOpen ? "bg-surface/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              H&B <span className="text-accent">Event Solution</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent ${
                    pathname === link.href
                      ? "text-accent"
                      : (link as any).highlight
                      ? "text-accent border border-accent/30 px-3 py-1 rounded-full hover:bg-accent/10"
                      : "text-accent-light"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user && (isAdmin || isSales) && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-accent-light hover:text-white transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface" />
                    )}
                  </button>
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-surface-2 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                          <h3 className="font-bold">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => {
                                markAllRead();
                                fetchRecentNotifications();
                              }}
                              className="text-xs text-accent hover:underline"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2">
                          {notifications.length > 0 ? (
                            notifications.map((n: any) => (
                              <div key={n.id} className={`p-3 rounded-lg mb-1 ${!n.is_read ? "bg-white/5" : ""}`}>
                                <p className="text-sm font-medium">{n.title}</p>
                                <p className="text-xs text-muted mt-1">{n.message}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted p-4 text-center">No notifications</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {user ? (
                <div className="flex items-center gap-4">
                  {(isAdmin || isSales) && (
                    <Link href="/admin/dashboard">
                      <Button variant="ghost" size="sm">Dashboard</Button>
                    </Link>
                  )}
                  <button onClick={() => setPasswordModalOpen(true)} className="text-sm text-muted hover:text-white transition-colors font-medium">Settings</button>
                  <button onClick={logout} className="text-sm text-danger hover:underline font-medium">Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm font-medium text-accent hover:text-white transition-colors">Sign In</Link>
                  <Link href="/quote">
                    <Button size="sm">Get a Quote</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-accent-light"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Update Password Modal */}
      <UpdatePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-surface pt-24 px-6 flex flex-col md:hidden"
          >
            <div className="flex flex-col gap-6 text-xl font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${
                    pathname === link.href
                      ? "text-accent"
                      : (link as any).highlight
                      ? "text-accent"
                      : "text-accent-light"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-4">
              {user ? (
                <>
                  {(isAdmin || isSales) && (
                    <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Dashboard</Button>
                    </Link>
                  )}
                  <Button variant="ghost" className="w-full text-danger border border-danger/20 hover:bg-danger/10" onClick={() => { logout(); setMobileMenuOpen(false); }}>Logout</Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full border border-white/10">Sign In</Button>
                  </Link>
                  <Link href="/quote" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Get a Quote</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
