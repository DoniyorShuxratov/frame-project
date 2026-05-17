"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Parallax state
  const [parallax, setParallax] = useState(0);
  const targetX  = useRef(0);
  const currentX = useRef(0);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      targetX.current = (e.clientX / window.innerWidth - 0.5) * 2;
    }
    function tick() {
      currentX.current += (targetX.current - currentX.current) * 0.04;
      setParallax(currentX.current);
      rafRef.current = requestAnimationFrame(tick);
    }
    window.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, role: "customer" } },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    router.push("/home");
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#F3F4F6",
    border: "none",
    borderRadius: 12,
    padding: "14px 18px",
    fontSize: 15,
    fontFamily: "Gilroy, system-ui, sans-serif",
    outline: "none",
    color: "#111",
    boxSizing: "border-box",
  };

  const cloud1X = parallax * -35;
  const cloud2X = parallax * -55;
  const modelX  = parallax * 22;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1B9CFC 0%, #87CEEB 100%)" }}
    >
      {/* Clouds layer 1 */}
      <img
        src="/images/clouds-1.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ zIndex: 0, transform: `translateX(${cloud1X}px)`, willChange: "transform" }}
      />

      {/* Clouds layer 2 */}
      <img
        src="/images/clouds-2.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ zIndex: 0, opacity: 0.65, transform: `translateX(${cloud2X}px)`, willChange: "transform" }}
      />

      {/* Model */}
      <img
        src="/images/model.png"
        alt=""
        className="hidden lg:block absolute pointer-events-none select-none object-contain"
        style={{
          left: -100,
          bottom: -160,
          height: "120vh",
          zIndex: 1,
          transform: `translateX(${modelX}px)`,
          willChange: "transform",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full flex items-center justify-center lg:justify-end lg:pr-[6%] px-4 py-8"
        style={{ zIndex: 2 }}
      >
        <div
          className="bg-white rounded-2xl flex flex-col w-full"
          style={{ maxWidth: 520, padding: "clamp(28px, 5vw, 48px)" }}
        >
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

          <p style={{ fontSize: 14, color: "#9CA3AF", fontFamily: "Gilroy, system-ui, sans-serif", marginBottom: 8 }}>
            Create an account
          </p>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "Gilroy, system-ui, sans-serif", fontWeight: 900, fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.05, color: "#111111" }}>
              Join the
            </div>
            <div style={{ fontFamily: "Gilroy, system-ui, sans-serif", fontWeight: 900, fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.05, color: "#1B9CFC", fontStyle: "italic" }}>
              Movement
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                style={inputStyle}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                style={inputStyle}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 8 characters)"
                required
                style={inputStyle}
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                required
                style={inputStyle}
              />
            </div>

            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16, fontFamily: "Gilroy, system-ui, sans-serif" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#1B9CFC", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>

            {error && (
              <p style={{ fontSize: 13, color: "#EF4444", background: "#FEF2F2", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontFamily: "Gilroy, system-ui, sans-serif" }}>
                {error}
              </p>
            )}

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
                transition: "background 0.15s",
                marginBottom: 20,
              }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF", fontFamily: "Gilroy, system-ui, sans-serif" }}>
              Welcome to FRAME
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
