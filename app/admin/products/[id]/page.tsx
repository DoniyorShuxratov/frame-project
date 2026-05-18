"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSelect } from "@/components/admin/AdminSelect";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const CATEGORIES   = ["T-Shirts", "Jackets", "Pants", "Dresses", "Accessories", "Shoes", "Hoodies"];

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [form, setForm] = useState({
    name: "", description: "", price: "", category: CATEGORIES[0],
    image_url: "", stock: "10",
  });
  const [sizes, setSizes]     = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) {
        setForm({
          name:        data.name,
          description: data.description ?? "",
          price:       String(data.price),
          category:    data.category,
          image_url:   data.image_url ?? "",
          stock:       String(data.stock),
        });
        setSizes(data.sizes ?? []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function toggleSize(size: string) {
    setSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())      { setError("Name is required"); return; }
    if (!form.price.trim())     { setError("Price is required"); return; }
    if (!form.image_url.trim()) { setError("Image URL is required"); return; }
    if (sizes.length === 0)     { setError("Select at least one size"); return; }

    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase.from("products").update({
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       parseFloat(form.price),
      category:    form.category,
      image_url:   form.image_url.trim(),
      stock:       parseInt(form.stock, 10),
      sizes,
    }).eq("id", id);

    if (updateError) { setError(updateError.message); setSaving(false); return; }
    router.push("/admin/products");
  }

  const inputCls = "w-full bg-black text-white border border-white/10 rounded-md px-4 py-2.5 font-gilroy text-body outline-none placeholder:text-white/20 focus:border-brand-primary transition-colors";
  const labelCls = "block font-gilroy font-semibold text-small text-white/70 mb-1.5";

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl space-y-4 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="h-12 bg-white/5 rounded-md" />)}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-gilroy font-bold text-h2 text-white">Edit Product</h1>
        <p className="font-gilroy text-small text-white/50 mt-1">Update the details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelCls}>Product Name</label>
          <input name="name" value={form.name} onChange={handleChange} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={3} className={`${inputCls} resize-none`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Price ($)</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Stock</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <AdminSelect
            value={form.category}
            onChange={(v) => setForm((p) => ({ ...p, category: v }))}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <div>
          <label className={labelCls}>Image URL</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className={inputCls} />
          {form.image_url && (
            <img src={form.image_url} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-md border border-white/10" />
          )}
        </div>

        <div>
          <label className={labelCls}>Sizes</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {SIZE_OPTIONS.map((size) => (
              <button key={size} type="button" onClick={() => toggleSize(size)}
                className={["px-3 py-1.5 rounded-md border font-gilroy font-semibold text-small transition-all",
                  sizes.includes(size)
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-transparent text-white/60 border-white/20 hover:border-white/50"].join(" ")}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-error text-small font-gilroy bg-error/10 rounded-md px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-brand-primary text-white font-gilroy font-semibold text-body px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="text-white/50 font-gilroy font-semibold text-body px-6 py-2.5 rounded-md border border-white/10 hover:border-white/30 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
