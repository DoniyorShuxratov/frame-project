"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId]       = useState<string | null>(null);
  const [email, setEmail]         = useState("");
  const [username, setUsername]   = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [clearing, setClearing]   = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");
      // Read avatar from auth metadata (no extra DB column needed)
      setAvatarUrl(user.user_metadata?.avatar_url ?? "");
      const { data: profile } = await supabase
        .from("profiles").select("username").eq("id", user.id).maybeSingle();
      setUsername(profile?.username ?? "");
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError("");
    const supabase = createClient();

    // Save username to profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("id", userId);

    // Save avatar_url to auth metadata (no schema change required)
    const { error: metaError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl.trim() },
    });

    setSaving(false);
    if (profileError || metaError) {
      setError(profileError?.message ?? metaError?.message ?? "Failed to save");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleClearHistory() {
    if (!userId) return;
    if (!confirm("Delete all your order history? This cannot be undone.")) return;
    setClearing(true);
    const supabase = createClient();
    await supabase.from("orders").delete().eq("customer_id", userId);
    setClearing(false);
    alert("Order history cleared.");
  }

  const inputCls = "w-full border border-stroke-default rounded-md px-4 py-2.5 font-gilroy text-body bg-surface-card text-content-primary outline-none focus:border-stroke-focus transition-colors";
  const labelCls = "block font-gilroy font-semibold text-small text-content-primary mb-1.5";

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-ds-4 py-ds-10 space-y-4 animate-pulse">
        <div className="h-8 bg-surface-item rounded w-1/3" />
        <div className="h-12 bg-surface-item rounded" />
        <div className="h-12 bg-surface-item rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-ds-4 sm:px-ds-6 py-ds-10">
      <h1 className="font-gilroy font-bold text-h1 text-content-primary mb-ds-8">My Profile</h1>

      {/* Avatar preview */}
      <div className="flex items-center gap-4 mb-ds-8">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-stroke-default" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-white font-gilroy font-bold text-h4">
            {email[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-gilroy font-semibold text-body text-content-primary">{username || email}</p>
          <p className="font-gilroy text-small text-content-secondary">{email}</p>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-surface-card border border-stroke-default rounded-xl p-ds-6 mb-ds-6">
        <h2 className="font-gilroy font-bold text-h5 text-content-primary mb-ds-5">Edit Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={labelCls}>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Profile Photo URL</label>
            <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…" className={inputCls} />
            <p className="text-xs text-content-secondary font-gilroy mt-1">Paste any image URL to use as your avatar</p>
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input value={email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
          </div>
          {error && <p className="text-error text-small font-gilroy bg-error-bg rounded-md px-3 py-2">{error}</p>}
          <Button type="submit" loading={saving}>
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-surface-card border border-error/20 rounded-xl p-ds-6">
        <h2 className="font-gilroy font-bold text-h5 text-content-primary mb-2">Danger Zone</h2>
        <p className="font-gilroy text-small text-content-secondary mb-ds-4">
          Permanently delete all your order history. This cannot be undone.
        </p>
        <button onClick={handleClearHistory} disabled={clearing}
          className="font-gilroy font-semibold text-small text-error border border-error/30 rounded-md px-4 py-2 hover:bg-error-bg transition-colors disabled:opacity-50">
          {clearing ? "Clearing…" : "Clear Order History"}
        </button>
      </div>
    </div>
  );
}
