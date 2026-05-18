"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/Toast";
import { Button } from "@/components/Button";
import {
  Store,
  User,
  Bell,
  Shield,
  Save,
  AlertTriangle,
  Package,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Store settings
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");

  // Inventory settings
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  // Notification preferences
  const [notifNewOrder, setNotifNewOrder] = useState(true);
  const [notifLowStock, setNotifLowStock] = useState(true);
  const [notifNewCustomer, setNotifNewCustomer] = useState(false);

  // Admin profile
  const [displayName, setDisplayName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  // Loading states
  const [savingStore, setSavingStore] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);

  // Load localStorage values on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedStoreName = localStorage.getItem("frame-store-name");
    const savedStoreDesc = localStorage.getItem("frame-store-description");
    const savedThreshold = localStorage.getItem("frame-low-stock-threshold");
    const savedNotifOrder = localStorage.getItem("frame-notif-new-order");
    const savedNotifStock = localStorage.getItem("frame-notif-low-stock");
    const savedNotifCustomer = localStorage.getItem("frame-notif-new-customer");

    if (savedStoreName !== null) setStoreName(savedStoreName);
    if (savedStoreDesc !== null) setStoreDesc(savedStoreDesc);
    if (savedThreshold !== null) setLowStockThreshold(Number(savedThreshold));
    if (savedNotifOrder !== null) setNotifNewOrder(savedNotifOrder === "true");
    if (savedNotifStock !== null) setNotifLowStock(savedNotifStock === "true");
    if (savedNotifCustomer !== null) setNotifNewCustomer(savedNotifCustomer === "true");
  }, []);

  // Load admin profile from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        setAdminEmail(user.email ?? "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (profile?.username) {
          setDisplayName(profile.username);
        }
      } catch {
        // Silently fail — profile load is non-critical on mount
      }
    };

    loadProfile();
  }, []);

  // Save store settings
  const handleSaveStore = async () => {
    setSavingStore(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("frame-store-name", storeName);
        localStorage.setItem("frame-store-description", storeDesc);
      }
      toast({ title: "Saved", variant: "success" });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to save", variant: "error" });
    } finally {
      setSavingStore(false);
    }
  };

  // Save admin profile
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ username: displayName })
        .eq("id", user.id);

      if (error) throw error;

      toast({ title: "Saved", variant: "success" });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to update profile", variant: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  // Save notification preferences
  const handleSaveNotifs = async () => {
    setSavingNotifs(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("frame-notif-new-order", notifNewOrder ? "true" : "false");
        localStorage.setItem("frame-notif-low-stock", notifLowStock ? "true" : "false");
        localStorage.setItem("frame-notif-new-customer", notifNewCustomer ? "true" : "false");
      }
      toast({ title: "Saved", variant: "success" });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to save", variant: "error" });
    } finally {
      setSavingNotifs(false);
    }
  };

  // Save inventory settings
  const handleSaveInventory = async () => {
    setSavingInventory(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("frame-low-stock-threshold", String(lowStockThreshold));
      }
      toast({ title: "Saved", variant: "success" });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to save", variant: "error" });
    } finally {
      setSavingInventory(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    const confirmed = window.confirm("Are you sure you want to sign out of all sessions?");
    if (!confirmed) return;

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to sign out", variant: "error" });
    }
  };

  // Initials for avatar
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-gilroy font-bold text-h2 text-white">Settings</h1>
        <p className="font-gilroy text-small text-white/40 mt-1">
          Manage your store and account preferences
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Store Settings */}
          <div className="bg-[#1e293b] border border-white/10 rounded-xl">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4 text-brand-primary" />
              </div>
              <div>
                <p className="font-gilroy font-semibold text-body text-white">Store Settings</p>
                <p className="font-gilroy text-small text-white/40">
                  Configure your store&apos;s public info
                </p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="FRAME"
                  className="w-full font-gilroy text-small text-white bg-[#0f172a] border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
                  Store Description
                </label>
                <textarea
                  rows={3}
                  value={storeDesc}
                  onChange={(e) => setStoreDesc(e.target.value)}
                  placeholder="A premium fashion store..."
                  className="w-full font-gilroy text-small text-white bg-[#0f172a] border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors resize-none"
                />
              </div>

              <p className="font-gilroy text-xs text-white/30">
                These settings are stored locally and used for display purposes.
              </p>

              <div className="pt-1">
                <Button
                  onClick={handleSaveStore}
                  disabled={savingStore}
                  variant="primary"
                  size="sm"
                >
                  {savingStore ? (
                    <span className="font-gilroy">Saving...</span>
                  ) : (
                    <span className="font-gilroy flex items-center gap-2">
                      <Save className="w-3.5 h-3.5" />
                      Save Store Settings
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* 2. Admin Profile */}
          <div className="bg-[#1e293b] border border-white/10 rounded-xl">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-brand-primary" />
              </div>
              <div>
                <p className="font-gilroy font-semibold text-body text-white">Admin Profile</p>
                <p className="font-gilroy text-small text-white/40">Update your admin account</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Admin"
                  className="w-full font-gilroy text-small text-white bg-[#0f172a] border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  disabled
                  className="w-full font-gilroy text-small text-white/40 bg-[#0f172a] border border-white/10 rounded-md px-3 py-2.5 outline-none cursor-not-allowed"
                />
                <p className="font-gilroy text-xs text-white/30 mt-1.5">
                  Email address cannot be changed here.
                </p>
              </div>

              <div className="pt-1">
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  variant="primary"
                  size="sm"
                >
                  {savingProfile ? (
                    <span className="font-gilroy">Saving...</span>
                  ) : (
                    <span className="font-gilroy flex items-center gap-2">
                      <Save className="w-3.5 h-3.5" />
                      Update Profile
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* 3. Notification Preferences */}
          <div className="bg-[#1e293b] border border-white/10 rounded-xl">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-brand-primary" />
              </div>
              <div>
                <p className="font-gilroy font-semibold text-body text-white">Notifications</p>
                <p className="font-gilroy text-small text-white/40">
                  Manage your alert preferences
                </p>
              </div>
            </div>

            <div className="px-6 py-2">
              {/* New Order Alert */}
              <div className="flex items-center justify-between py-4 border-b border-white/[0.06]">
                <div>
                  <p className="font-gilroy font-semibold text-small text-white">New Order Alert</p>
                  <p className="font-gilroy text-xs text-white/40 mt-0.5">
                    Notify when a new order is placed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifNewOrder((v) => !v)}
                  className="relative flex-shrink-0 rounded-full transition-colors duration-200"
                  style={{ width: 44, height: 24, backgroundColor: notifNewOrder ? "#1B9CFC" : "rgba(255,255,255,0.15)" }}
                >
                  <span
                    className="absolute rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ width: 18, height: 18, top: 3, left: 3, transform: notifNewOrder ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {/* Low Stock Alert */}
              <div className="flex items-center justify-between py-4 border-b border-white/[0.06]">
                <div>
                  <p className="font-gilroy font-semibold text-small text-white">Low Stock Alert</p>
                  <p className="font-gilroy text-xs text-white/40 mt-0.5">
                    Notify when product stock drops below threshold
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifLowStock((v) => !v)}
                  className="relative flex-shrink-0 rounded-full transition-colors duration-200"
                  style={{ width: 44, height: 24, backgroundColor: notifLowStock ? "#1B9CFC" : "rgba(255,255,255,0.15)" }}
                >
                  <span
                    className="absolute rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ width: 18, height: 18, top: 3, left: 3, transform: notifLowStock ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {/* New Customer */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-gilroy font-semibold text-small text-white">New Customer</p>
                  <p className="font-gilroy text-xs text-white/40 mt-0.5">
                    Notify when a new customer registers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifNewCustomer((v) => !v)}
                  className="relative flex-shrink-0 rounded-full transition-colors duration-200"
                  style={{ width: 44, height: 24, backgroundColor: notifNewCustomer ? "#1B9CFC" : "rgba(255,255,255,0.15)" }}
                >
                  <span
                    className="absolute rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ width: 18, height: 18, top: 3, left: 3, transform: notifNewCustomer ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>

            <div className="px-6 pb-5">
              <Button
                onClick={handleSaveNotifs}
                disabled={savingNotifs}
                variant="primary"
                size="sm"
              >
                {savingNotifs ? (
                  <span className="font-gilroy">Saving...</span>
                ) : (
                  <span className="font-gilroy flex items-center gap-2">
                    <Save className="w-3.5 h-3.5" />
                    Save Preferences
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* 4. Inventory Settings */}
          <div className="bg-[#1e293b] border border-white/10 rounded-xl">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-brand-primary" />
              </div>
              <div>
                <p className="font-gilroy font-semibold text-body text-white">Inventory</p>
                <p className="font-gilroy text-small text-white/40">Configure stock alerts</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={lowStockThreshold}
                  onChange={(e) =>
                    setLowStockThreshold(
                      Math.min(50, Math.max(1, Number(e.target.value)))
                    )
                  }
                  className="w-full font-gilroy text-small text-white bg-[#0f172a] border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
                />
                <p className="font-gilroy text-xs text-white/30 mt-1.5">
                  Products with stock below this number will be flagged as low stock
                </p>
              </div>

              <div className="bg-[#0f172a] rounded-lg px-4 py-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="font-gilroy text-small text-white/60">
                  Currently flagging products with stock &lt;{" "}
                  <span className="text-white font-semibold">{lowStockThreshold}</span>
                </p>
              </div>

              <div className="pt-1">
                <Button
                  onClick={handleSaveInventory}
                  disabled={savingInventory}
                  variant="primary"
                  size="sm"
                >
                  {savingInventory ? (
                    <span className="font-gilroy">Saving...</span>
                  ) : (
                    <span className="font-gilroy flex items-center gap-2">
                      <Save className="w-3.5 h-3.5" />
                      Save Inventory Settings
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* 1. Store Preview */}
          <div className="bg-[#1e293b] border border-white/10 rounded-xl">
            <div className="px-6 py-4 border-b border-white/[0.07]">
              <p className="font-gilroy font-semibold text-body text-white">Store Preview</p>
            </div>
            <div className="px-6 py-5">
              <div className="bg-[#0f172a] rounded-lg p-4">
                <span className="font-gilroy font-bold text-h4 text-white tracking-tight">
                  {storeName || "FRAME"}
                </span>
                <p className="font-gilroy text-small text-white/40 mt-1">
                  {storeDesc || "A premium fashion store"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Admin Info */}
          <div className="bg-[#1e293b] border border-white/10 rounded-xl">
            <div className="px-6 py-4 border-b border-white/[0.07]">
              <p className="font-gilroy font-semibold text-body text-white">Account Info</p>
            </div>
            <div className="px-6 py-5 flex flex-col items-center text-center gap-3">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-gilroy font-bold text-body text-brand-primary">
                  {initials}
                </span>
              </div>

              {/* Name */}
              <div>
                <p className="font-gilroy font-bold text-body text-white">
                  {displayName || "Admin"}
                </p>
                {adminEmail && (
                  <p className="font-gilroy text-xs text-white/40 mt-0.5">{adminEmail}</p>
                )}
              </div>

              {/* Admin badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary/15 text-brand-primary rounded-full font-gilroy font-semibold text-small border border-brand-primary/25">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            </div>
          </div>

          {/* 3. Danger Zone */}
          <div className="bg-[#1e293b] border border-red-500/20 rounded-xl">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="font-gilroy font-semibold text-body text-red-400">Danger Zone</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="font-gilroy text-small text-white/40">
                This action will end all active sessions.
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full font-gilroy font-semibold text-small text-red-400 border border-red-500/30 rounded-md px-4 py-2.5 hover:bg-red-500/10 transition-colors"
              >
                Sign out of all sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
