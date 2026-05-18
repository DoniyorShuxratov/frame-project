"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Modal } from "@/components/admin/Modal";
import { SlideOver } from "@/components/admin/SlideOver";
import { EmptyState } from "@/components/admin/EmptyState";
import { useToast } from "@/components/admin/Toast";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/Button";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Grid,
  List,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,

} from "lucide-react";

// в"Ђв"Ђв"Ђ Types в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  image_url: string;
  stock: number;
  created_at: string;
  is_active?: boolean;
}

const CATEGORIES = [
  "T-Shirts",
  "Jackets",
  "Pants",
  "Dresses",
  "Accessories",
  "Shoes",
  "Hoodies",
];
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const GRID_PAGE_SIZE = 12;
const LIST_PAGE_SIZE = 10;

// в"Ђв"Ђв"Ђ Helpers в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-gilroy font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
        Out of Stock
      </span>
    );
  if (stock < 5)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-gilroy font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
        {stock} left
      </span>
    );
  if (stock <= 10)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-gilroy font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
        {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-gilroy font-semibold bg-green-500/15 text-green-400 border border-green-500/25">
      {stock} in stock
    </span>
  );
}

// в"Ђв"Ђв"Ђ Main Page в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

export default function AdminProductsPage() {
  // в"Ђв"Ђ Data в"Ђв"Ђ
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // в"Ђв"Ђ View в"Ђв"Ђ
  const [view, setView] = useState<"grid" | "list">("grid");

  // в"Ђв"Ђ Filters в"Ђв"Ђ
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // в"Ђв"Ђ Modals в"Ђв"Ђ
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // в"Ђв"Ђ Form state в"Ђв"Ђ
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formStock, setFormStock] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formSizes, setFormSizes] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const { toast } = useToast();

  // в"Ђв"Ђ Load в"Ђв"Ђ
  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load products", variant: "error" });
    } else {
      setProducts((data as Product[]) ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  // в"Ђв"Ђ Reset filter page on filter change в"Ђв"Ђ
  useEffect(() => {
    setPage(1);
  }, [search, catFilter, stockFilter, sort, view]);

  // в"Ђв"Ђ Form helpers в"Ђв"Ђ
  function resetForm() {
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormCategory(CATEGORIES[0]);
    setFormStock("");
    setFormImageUrl("");
    setFormSizes([]);
    setFormIsActive(true);
    setFormError("");
  }

  function openAdd() {
    resetForm();
    setAddOpen(true);
  }

  function closeAdd() {
    setAddOpen(false);
    resetForm();
  }

  function openEdit(p: Product) {
    setFormName(p.name);
    setFormDesc(p.description ?? "");
    setFormPrice(String(p.price));
    setFormCategory(p.category ?? CATEGORIES[0]);
    setFormStock(String(p.stock));
    setFormImageUrl(p.image_url ?? "");
    setFormSizes(p.sizes ?? []);
    setFormIsActive(p.is_active !== false);
    setFormError("");
    setEditProduct(p);
  }

  function closeEdit() {
    setEditProduct(null);
    resetForm();
  }

  function openDelete(p: Product) {
    setDeleteProduct(p);
  }

  function closeDelete() {
    setDeleteProduct(null);
  }

  function toggleSize(s: string) {
    setFormSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  // в"Ђв"Ђ Submit (add or edit) в"Ђв"Ђ
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Product name is required.");
      return;
    }
    const parsedPrice = parseFloat(formPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }
    if (formSizes.length === 0) {
      setFormError("Select at least one size.");
      return;
    }
    if (!formImageUrl.trim()) {
      setFormError("Image URL is required.");
      return;
    }

    setFormSaving(true);
    const supabase = createClient();
    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      price: parsedPrice,
      category: formCategory,
      stock: parseInt(formStock) || 0,
      image_url: formImageUrl.trim(),
      sizes: formSizes,
      is_active: formIsActive,
    };

    if (editProduct) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editProduct.id);
      if (error) {
        toast({ title: "Failed to update product", description: error.message, variant: "error" });
      } else {
        toast({ title: "Product updated", variant: "success" });
        closeEdit();
        load();
      }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        toast({ title: "Failed to add product", description: error.message, variant: "error" });
      } else {
        toast({ title: "Product added", variant: "success" });
        closeAdd();
        load();
      }
    }
    setFormSaving(false);
  }

  // в"Ђв"Ђ Delete в"Ђв"Ђ
  async function handleDelete() {
    if (!deleteProduct) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deleteProduct.id);
    if (error) {
      toast({ title: "Failed to delete product", description: error.message, variant: "error" });
    } else {
      toast({ title: "Product deleted", variant: "success" });
      closeDelete();
      load();
    }
    setDeleting(false);
  }

  // в"Ђв"Ђ Filtering в"Ђв"Ђ
  const filtered = useMemo(() => {
    let r = products;
    if (search)
      r = r.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      );
    if (catFilter !== "all") r = r.filter((p) => p.category === catFilter);
    if (stockFilter === "instock") r = r.filter((p) => p.stock > 10);
    if (stockFilter === "low") r = r.filter((p) => p.stock > 0 && p.stock <= 10);
    if (stockFilter === "out") r = r.filter((p) => p.stock === 0);
    r = [...r].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "stock-asc") return a.stock - b.stock;
      if (sort === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      return 0;
    });
    return r;
  }, [products, search, catFilter, stockFilter, sort]);

  // в"Ђв"Ђ Pagination в"Ђв"Ђ
  const pageSize = view === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // в"Ђв"Ђ Stats в"Ђв"Ђ
  const totalActive = products.filter((p) => p.is_active !== false).length;
  const totalLowStock = products.filter((p) => p.stock > 0 && p.stock < 5).length;
  const totalOutOfStock = products.filter((p) => p.stock === 0).length;

  // в"Ђв"Ђ Shared form JSX в"Ђв"Ђ
  const formContent = (
    <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {formError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="font-gilroy text-small text-red-400">{formError}</p>
          </div>
        )}

        {/* Product Name */}
        <div className="space-y-1.5">
          <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
            Product Name
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Classic White Tee"
            className="w-full font-gilroy text-small text-white bg-black border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
            Description
          </label>
          <textarea
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            rows={4}
            placeholder="Product description..."
            className="w-full font-gilroy text-small text-white bg-black border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors resize-none"
          />
        </div>

        {/* Price + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="0.00"
              className="w-full font-gilroy text-small text-white bg-black border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
              Category
            </label>
            <AdminSelect
              value={formCategory}
              onChange={setFormCategory}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </div>

        {/* Stock + Image URL */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
              Stock
            </label>
            <input
              type="number"
              min="0"
              value={formStock}
              onChange={(e) => setFormStock(e.target.value)}
              placeholder="0"
              className="w-full font-gilroy text-small text-white bg-black border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
              Image URL
            </label>
            <input
              type="text"
              value={formImageUrl}
              onChange={(e) => setFormImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full font-gilroy text-small text-white bg-black border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Image preview */}
        {formImageUrl.trim() && (
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-black border border-white/10 flex-shrink-0">
              <img
                src={formImageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <p className="font-gilroy text-xs text-white/40">Image preview</p>
          </div>
        )}

        {/* Sizes */}
        <div className="space-y-1.5">
          <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
            Sizes
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-3 py-1.5 rounded-md font-gilroy font-semibold text-small border transition-all ${
                  formSizes.includes(s)
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "border-white/15 text-white/50 hover:border-white/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Active toggle */}
        <div className="space-y-1.5">
          <label className="block font-gilroy font-semibold text-small text-white/60 mb-1.5">
            Status
          </label>
          <div className="flex items-center gap-3">
            <span className="font-gilroy text-small text-white/60">Status:</span>
            <button
              type="button"
              onClick={() => setFormIsActive((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formIsActive ? "bg-brand-primary" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  formIsActive ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`font-gilroy font-semibold text-small ${
                formIsActive ? "text-green-400" : "text-white/40"
              }`}
            >
              {formIsActive ? "Active" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={editProduct ? closeEdit : closeAdd}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={formSaving}>
          {editProduct ? "Save Changes" : "Save Product"}
        </Button>
      </div>
    </form>
  );

  // в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  return (
    <div className="p-6 lg:p-8">
      {/* в"Ђв"Ђ Header в"Ђв"Ђ */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-gilroy font-bold text-h2 text-white">Products</h1>
          <p className="font-gilroy text-small text-white/50 mt-0.5">
            {products.length} total product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* в"Ђв"Ђ Stats row в"Ђв"Ђ */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { label: "Total Products", value: products.length, color: "text-white/70" },
          { label: "Active", value: totalActive, color: "text-green-400" },
          { label: "Low Stock", value: totalLowStock, color: "text-yellow-400" },
          { label: "Out of Stock", value: totalOutOfStock, color: "text-red-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg"
          >
            <span className={`font-gilroy font-bold text-small ${s.color}`}>
              {s.value}
            </span>
            <span className="font-gilroy text-small text-white/40">{s.label}</span>
          </div>
        ))}
      </div>

      {/* в"Ђв"Ђ Filter bar в"Ђв"Ђ */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full font-gilroy text-small text-white bg-white/5 border border-white/10 rounded-md pl-9 pr-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
          />
        </div>

        {/* Category */}
        <AdminSelect
          value={catFilter}
          onChange={setCatFilter}
          options={[
            { value: "all", label: "All Categories" },
            ...CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          className="min-w-[150px]"
        />

        {/* Stock filter */}
        <AdminSelect
          value={stockFilter}
          onChange={setStockFilter}
          options={[
            { value: "all",     label: "All Stock" },
            { value: "instock", label: "In Stock (>10)" },
            { value: "low",     label: "Low Stock (1–10)" },
            { value: "out",     label: "Out of Stock" },
          ]}
          className="min-w-[140px]"
        />

        {/* Sort */}
        <AdminSelect
          value={sort}
          onChange={setSort}
          options={[
            { value: "newest",     label: "Newest" },
            { value: "name-asc",   label: "Name A–Z" },
            { value: "name-desc",  label: "Name Z–A" },
            { value: "price-asc",  label: "Price Low–High" },
            { value: "price-desc", label: "Price High–Low" },
            { value: "stock-asc",  label: "Stock Low–High" },
          ]}
          className="min-w-[150px]"
        />

        {/* View toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-1 ml-auto">
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded transition-colors ${
              view === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded transition-colors ${
              view === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* в"Ђв"Ђ Content в"Ђв"Ђ */}
      {loading ? (
        /* Loading skeletons */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-white/5" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-4 bg-white/5 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl">
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              search || catFilter !== "all" || stockFilter !== "all"
                ? "Try adjusting your filters."
                : "Get started by adding your first product."
            }
            action={
              !search && catFilter === "all" && stockFilter === "all" ? (
                <Button variant="primary" size="sm" onClick={openAdd}>
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : view === "grid" ? (
        /* в"Ђв"Ђ Grid view в"Ђв"Ђ */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginated.map((product) => (
            <div
              key={product.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition-all"
            >
              {/* Image */}
              <div className="aspect-square bg-black overflow-hidden relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-white/10" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDelete(product)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Draft badge */}
                {product.is_active === false && (
                  <div className="absolute top-2 left-2">
                    <StatusBadge status="draft" size="sm" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3.5">
                <p className="font-gilroy font-semibold text-small text-white truncate">
                  {product.name}
                </p>
                <p className="font-gilroy text-xs text-white/40 mt-0.5">
                  {product.category}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-gilroy font-bold text-body text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  <StockBadge stock={product.stock} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* в"Ђв"Ђ List view в"Ђв"Ђ */
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10">
                  {["Product", "Category", "Price", "Sizes", "Stock", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-4 font-gilroy font-semibold text-xs text-white/40 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Product */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-black flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-gilroy font-semibold text-small text-white truncate max-w-[160px]">
                            {product.name}
                          </p>
                          <p className="font-gilroy text-xs text-white/40 mt-0.5">
                            #{product.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="font-gilroy text-small text-white/60">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <span className="font-gilroy font-semibold text-small text-white">
                        ${product.price.toFixed(2)}
                      </span>
                    </td>

                    {/* Sizes */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                        {(product.sizes ?? []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded font-gilroy text-xs text-white/50 bg-white/5 border border-white/10"
                          >
                            {s}
                          </span>
                        ))}
                        {(product.sizes ?? []).length > 3 && (
                          <span className="font-gilroy text-xs text-white/30">
                            +{(product.sizes ?? []).length - 3} more
                          </span>
                        )}
                        {(!product.sizes || product.sizes.length === 0) && (
                          <span className="font-gilroy text-xs text-white/20">&ndash;</span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <StockBadge stock={product.stock} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={product.is_active !== false ? "active" : "draft"}
                        size="sm"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(product)}
                          className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* в"Ђв"Ђ Pagination в"Ђв"Ђ */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="font-gilroy text-small text-white/40">
            Showing {(page - 1) * pageSize + 1}&ndash;
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 font-gilroy text-small text-white/20">
                    вЂ¦
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-md font-gilroy font-semibold text-small transition-colors ${
                      page === p
                        ? "bg-brand-primary text-white"
                        : "text-white/50 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* в"Ђв"Ђ Add SlideOver в"Ђв"Ђ */}
      <SlideOver open={addOpen} onClose={closeAdd} title="Add Product" width="xl">
        {formContent}
      </SlideOver>

      {/* в"Ђв"Ђ Edit SlideOver в"Ђв"Ђ */}
      <SlideOver
        open={editProduct !== null}
        onClose={closeEdit}
        title="Edit Product"
        width="xl"
      >
        {formContent}
      </SlideOver>

      {/* в"Ђв"Ђ Delete Modal в"Ђв"Ђ */}
      <Modal
        open={deleteProduct !== null}
        onClose={closeDelete}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-gilroy text-small text-white/70 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {deleteProduct?.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" onClick={closeDelete}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDelete}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
