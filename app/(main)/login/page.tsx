"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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

  const inputStyle: React.CSSProperties = {
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
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1B9CFC 0%, #87CEEB 100%)" }}
    >
      <style>{`
        @keyframes cloudDrift {
          0%   { transform: translateX(0px) scale(1); }
          50%  { transform: translateX(40px) scale(1.03); }
          100% { transform: translateX(0px) scale(1); }
        }
        @keyframes cloudDriftReverse {
          0%   { transform: translateX(0px) scale(1.02); }
          50%  { transform: translateX(-50px) scale(1); }
          100% { transform: translateX(0px) scale(1.02); }
        }
        @keyframes cloudFade {
          0%   { opacity: 0.7; }
          50%  { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>

      {/* Clouds layer 1 */}
      <img
        src="/images/clouds-1.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{
          zIndex: 0,
          animation: "cloudDrift 30s ease-in-out infinite, cloudFade 20s ease-in-out infinite",
        }}
      />
      {/* Clouds layer 2 — opposite drift, slightly offset */}
      <img
        src="/images/clouds-2.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{
          zIndex: 0,
          opacity: 0.6,
          animation: "cloudDriftReverse 45s ease-in-out infinite",
        }}
      />

      {/* Model — bottom-left, desktop only */}
      <img
        src="/images/model.png"
        alt=""
        className="hidden lg:block absolute pointer-events-none select-none object-contain"
        style={{
          left: -100,
          bottom: -160,
          height: "120vh",
          zIndex: 1,
        }}
      />

      {/* Card — centered on mobile, right-aligned on desktop */}
      <div
        className="relative w-full flex items-center justify-center lg:justify-end lg:pr-[6%] px-4 py-8"
        style={{ zIndex: 2 }}
      >
        <div
          className="bg-white rounded-2xl shadow-xl flex flex-col w-full"
          style={{ maxWidth: 520, padding: "clamp(28px, 5vw, 48px)" }}
        >
          {/* Logo */}
          <span style={{
            fontFamily: "Gilroy, system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 28,
            color: "#1B9CFC",
            fontStyle: "italic",
            letterSpacing: "-0.5px",
            marginBottom: 4,
            display: "block",
          }}>
            FRAME
          </span>

          {/* Sub-heading */}
          <p style={{ fontSize: 14, color: "#9CA3AF", fontFamily: "Gilroy, system-ui, sans-serif", marginBottom: 8 }}>
            Login to
          </p>

          {/* Main heading */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "Gilroy, system-ui, sans-serif", fontWeight: 900, fontSize: "clamp(36px, 5vw, 48px)", lineHeight: 1.05, color: "#111111" }}>
              Dress for the
            </div>
            <div style={{ fontFamily: "Gilroy, system-ui, sans-serif", fontWeight: 900, fontSize: "clamp(36px, 5vw, 48px)", lineHeight: 1.05, color: "#1B9CFC", fontStyle: "italic" }}>
              Future
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 10 }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email" required style={inputStyle} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" required style={inputStyle} />
            </div>

            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16, fontFamily: "Gilroy, system-ui, sans-serif" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "#1B9CFC", fontWeight: 600, textDecoration: "none" }}>
                Sign up
              </Link>
            </p>

            {error && (
              <p style={{ fontSize: 13, color: "#EF4444", background: "#FEF2F2", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontFamily: "Gilroy, system-ui, sans-serif" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{
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
            }}>
              {loading ? "Logging in…" : "Log in"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF", fontFamily: "Gilroy, system-ui, sans-serif" }}>
              Welcome back
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
