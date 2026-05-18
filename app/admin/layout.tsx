"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart2,
  Settings, LogOut, ChevronLeft, ChevronRight, Bell, Menu, X,
} from "lucide-react";
import { ToastProvider } from "@/components/admin/Toast";

const NAV_ITEMS = [
  { href: "/admin/dashboard",  label: "Dashboard",  icon: LayoutDashboard, live: true },
  { href: "/admin/orders",     label: "Orders",     icon: ShoppingBag },
  { href: "/admin/products",   label: "Products",   icon: Package },
  { href: "/admin/customers",  label: "Customers",  icon: Users },
  { href: "/admin/analytics",  label: "Analytics",  icon: BarChart2 },
  { href: "/admin/settings",   label: "Settings",   icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":  "Dashboard",
  "/admin/orders":     "Orders",
  "/admin/products":   "Products",
  "/admin/customers":  "Customers",
  "/admin/analytics":  "Analytics",
  "/admin/settings":   "Settings",
};

function getPageTitle(pathname: string) {
  for (const [key, label] of Object.entries(PAGE_TITLES)) {
    if (pathname === key || pathname.startsWith(key + "/")) return label;
  }
  return "Admin";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [adminName,   setAdminName]   = useState("Admin");
  const [adminEmail,  setAdminEmail]  = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [notifOpen,   setNotifOpen]   = useState(false);

  // Restore collapsed state
  useEffect(() => {
    const stored = localStorage.getItem("admin-sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      localStorage.setItem("admin-sidebar-collapsed", String(!v));
      return !v;
    });
  }, []);

  // Auth guard + profile fetch
  useEffect(() => {
    if (pathname === "/admin/login") return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/admin/login"); return; }
      const { data } = await supabase
        .from("profiles")
        .select("role, username")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.role !== "admin") { router.replace("/admin/login"); return; }
      setAdminName(data?.username || user.email?.split("@")[0] || "Admin");
      setAdminEmail(user.email ?? "");
    });
  }, [pathname, router]);

  // Fetch pending orders count
  const fetchPending = useCallback(async () => {
    const supabase = createClient();
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    setPendingCount(count ?? 0);
  }, []);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetchPending();
    const iv = setInterval(fetchPending, 30_000);
    return () => clearInterval(iv);
  }, [pathname, fetchPending]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (pathname === "/admin/login") {
    return <ToastProvider>{children}</ToastProvider>;
  }

  const pageTitle = getPageTitle(pathname);
  const avatar    = initials(adminName);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 flex-shrink-0">
        {!collapsed || mobile ? (
          <>
            <div className="flex items-center gap-2">
              <span className="font-gilroy font-bold text-h5 text-white tracking-tight">FRAME</span>
              <span className="text-xs font-gilroy text-white/30 uppercase tracking-widest">Admin</span>
            </div>
            {!mobile && (
              <button
                onClick={toggleCollapsed}
                className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={toggleCollapsed}
            className="mx-auto text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon   = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !mobile ? item.label : undefined}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-gilroy font-medium text-small transition-all",
                collapsed && !mobile ? "justify-center" : "",
                active
                  ? "bg-brand-primary text-white"
                  : "text-white/55 hover:bg-white/[0.08] hover:text-white",
              ].join(" ")}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {(!collapsed || mobile) && (
                <span className="flex-1 whitespace-nowrap">{item.label}</span>
              )}
              {(!collapsed || mobile) && item.live && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin profile + logout */}
      <div className="px-2 pb-4 pt-3 border-t border-white/10 flex-shrink-0 space-y-1">
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
              <span className="font-gilroy font-bold text-xs text-white">{avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-gilroy font-semibold text-small text-white truncate">{adminName}</p>
              <p className="font-gilroy text-xs text-white/40 truncate">{adminEmail}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center" title={adminName}>
              <span className="font-gilroy font-bold text-xs text-white">{avatar}</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed && !mobile ? "Logout" : undefined}
          className={[
            "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg font-gilroy font-medium text-small",
            "text-white/55 hover:bg-white/[0.08] hover:text-white transition-all",
            collapsed && !mobile ? "justify-center" : "",
          ].join(" ")}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="flex h-screen bg-[#0f172a] overflow-hidden">

        {/* Desktop sidebar */}
        <aside
          className={[
            "hidden lg:flex flex-col flex-shrink-0 bg-[#0b1628] border-r border-white/[0.07]",
            "transition-all duration-200 ease-in-out",
            collapsed ? "w-16" : "w-60",
          ].join(" ")}
        >
          <SidebarContent />
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-64 flex-shrink-0 bg-[#0b1628] border-r border-white/[0.07]">
              <SidebarContent mobile />
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Top header */}
          <header className="h-14 flex items-center justify-between px-4 lg:px-6 bg-[#0f172a] border-b border-white/[0.07] flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                className="lg:hidden text-white/50 hover:text-white transition-colors"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 font-gilroy text-small">
                <span className="text-white/30">Admin</span>
                <span className="text-white/20">/</span>
                <span className="text-white font-semibold">{pageTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {pendingCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-gilroy font-bold text-white">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-40 p-4">
                      <p className="font-gilroy font-semibold text-small text-white mb-1">Notifications</p>
                      {pendingCount > 0 ? (
                        <Link
                          href="/admin/orders"
                          onClick={() => setNotifOpen(false)}
                          className="flex items-center gap-2 mt-2 text-small font-gilroy text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                          {pendingCount} pending order{pendingCount !== 1 ? "s" : ""} need attention
                        </Link>
                      ) : (
                        <p className="font-gilroy text-small text-white/30 mt-1">All caught up!</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center" title={adminName}>
                <span className="font-gilroy font-bold text-xs text-white">{avatar}</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
