"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

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
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role === "admin") { router.push("/admin/dashboard"); return; }
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface-page flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-gilroy font-bold text-h2 text-brand-primary">FRAME</Link>
          <p className="font-gilroy text-body text-content-secondary mt-2">Sign in to your account</p>
        </div>

        <div className="bg-surface-card border border-stroke-default rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && (
              <p className="text-error text-small font-gilroy bg-error-bg rounded-md px-3 py-2">{error}</p>
            )}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="text-center mt-6 font-gilroy text-body text-content-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand-primary font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>

        <p className="text-center mt-4 text-small text-content-secondary font-gilroy">
          Admin?{" "}
          <Link href="/admin/login" className="text-brand-primary hover:underline">Admin login →</Link>
        </p>
      </div>
    </div>
  );
}
