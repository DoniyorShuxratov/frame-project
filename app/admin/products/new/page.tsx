"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const CATEGORIES   = ["T-Shirts", "Jackets", "Pants", "Dresses", "Accessories", "Shoes", "Hoodies"];

export default function AdminNewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: CATEGORIES[0],
    image_url: "", stock: "10",
  });
  const [sizes, setSizes]   = useState<string[]>(["M", "L"]);
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function toggleSize(size: string) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
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
    const { error: insertError } = await supabase.from("products").insert({
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       parseFloat(form.price),
      category:    form.category,
      image_url:   form.image_url.trim(),
      stock:       parseInt(form.stock, 10),
      sizes,
    });

    if (insertError) { setError(insertError.message); setSaving(false); return; }
    router.push("/admin/products");
  }

  const inputCls = "w-full bg-black text-white border border-white/10 rounded-md px-4 py-2.5 font-gilroy text-body outline-none placeholder:text-white/20 focus:border-brand-primary transition-colors";
  const labelCls = "block font-gilroy font-semibold text-small text-white/70 mb-1.5";

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-gilroy font-bold text-h2 text-white">Add Product</h1>
        <p className="font-gilroy text-small text-white/50 mt-1">Fill in the details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelCls}>Product Name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Classic Tee" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="A brief description of the productвЂ¦"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Price ($)</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="29.99" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Stock</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="10" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Image URL</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://images.unsplash.com/вЂ¦" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Sizes</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={[
                  "px-3 py-1.5 rounded-md border font-gilroy font-semibold text-small transition-all",
                  sizes.includes(size)
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-transparent text-white/60 border-white/20 hover:border-white/50",
                ].join(" ")}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-error text-small font-gilroy bg-error/10 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-primary text-white font-gilroy font-semibold text-body px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "SavingвЂ¦" : "Save Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-white/50 font-gilroy font-semibold text-body px-6 py-2.5 rounded-md border border-white/10 hover:border-white/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
