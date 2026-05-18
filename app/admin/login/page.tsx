"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";

export default function AdminLoginPage() {
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
    if (!user) { setError("Authentication failed"); setLoading(false); return; }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      setError(`Profile error: ${profileError.message}`);
      setLoading(false);
      return;
    }

    if (!profile) {
      await supabase.auth.signOut();
      setError("No profile found. Run setup.sql and re-register.");
      setLoading(false);
      return;
    }

    if (profile.role !== "admin") {
      await supabase.auth.signOut();
      setError(`Access denied. Your role is "${profile.role}", not "admin".`);
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-gilroy font-bold text-h2 text-white">FRAME</span>
          <p className="font-gilroy text-body text-white/50 mt-2">Admin Portal</p>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-gilroy font-semibold text-small text-white/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="font-gilroy text-body bg-[#0f172a] text-white border border-white/10 px-4 py-2.5 rounded-md outline-none placeholder:text-white/20 focus:border-brand-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-gilroy font-semibold text-small text-white/70">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="font-gilroy text-body bg-[#0f172a] text-white border border-white/10 px-4 py-2.5 rounded-md outline-none placeholder:text-white/20 focus:border-brand-primary transition-colors"
              />
            </div>
            {error && (
              <p className="text-error text-small font-gilroy bg-error-bg rounded-md px-3 py-2">{error}</p>
            )}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In as Admin
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
