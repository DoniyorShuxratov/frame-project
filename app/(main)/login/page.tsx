"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role === "admin") { router.push("/admin/dashboard"); return; }
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #1B9CFC 100%)" }}
    >
      {/* Left side — visible on lg+ */}
      <div className="hidden lg:block absolute inset-y-0 left-0 w-[55%] pointer-events-none select-none">
        {/* Clouds */}
        <img
          src="/images/clouds.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Model */}
        <img
          src="/images/model.png"
          alt=""
          className="absolute bottom-0 left-1/2 -translate-x-1/2 object-contain"
          style={{ height: "85vh" }}
        />
      </div>

      {/* Right side — card */}
      <div className="relative z-10 w-full flex items-center justify-center lg:justify-end lg:pr-[7%] px-4 py-10">
        <div
          className="bg-white rounded-2xl shadow-xl flex flex-col w-full"
          style={{ maxWidth: 420, padding: 48 }}
        >
          {/* Logo */}
          <div className="mb-1">
            <span style={{
              fontFamily: "Gilroy, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 28,
              color: "#1B9CFC",
              fontStyle: "italic",
              letterSpacing: "-0.5px",
            }}>
              FRAME
            </span>
          </div>

          {/* Sub-heading */}
          <p style={{ fontSize: 14, color: "#9CA3AF", fontFamily: "Gilroy, system-ui, sans-serif", marginBottom: 8 }}>
            Login to
          </p>

          {/* Main heading */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontFamily: "Gilroy, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 48,
              lineHeight: 1.05,
              color: "#111111",
            }}>
              Dress for the
            </div>
            <div style={{
              fontFamily: "Gilroy, system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 48,
              lineHeight: 1.05,
              color: "#1B9CFC",
              fontStyle: "italic",
            }}>
              Future
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 10 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                style={{
                  width: "100%",
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 18px",
                  fontSize: 15,
                  fontFamily: "Gilroy, system-ui, sans-serif",
                  outline: "none",
                  color: "#111",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{
                  width: "100%",
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 18px",
                  fontSize: 15,
                  fontFamily: "Gilroy, system-ui, sans-serif",
                  outline: "none",
                  color: "#111",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Sign up link */}
            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16, fontFamily: "Gilroy, system-ui, sans-serif" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "#1B9CFC", fontWeight: 600, textDecoration: "none" }}>
                Sign up
              </Link>
            </p>

            {/* Error */}
            {error && (
              <p style={{
                fontSize: 13,
                color: "#EF4444",
                background: "#FEF2F2",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 12,
                fontFamily: "Gilroy, system-ui, sans-serif",
              }}>
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#7CC8FD" : "#1B9CFC",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "16px",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "Gilroy, system-ui, sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
                marginBottom: 20,
              }}
            >
              {loading ? "Logging in…" : "Log in"}
            </button>

            {/* Welcome back */}
            <p style={{
              textAlign: "center",
              fontSize: 13,
              color: "#9CA3AF",
              fontFamily: "Gilroy, system-ui, sans-serif",
            }}>
              Welcome back
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
