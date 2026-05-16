"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";

interface Product {
  id: string; name: string; description: string; price: number;
  category: string; sizes: string[]; image_url: string; stock: number;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct]     = useState<Product | null>(null);
  const [loading, setLoading]     = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded]         = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      setProduct(data ?? null);
      setLoading(false);
    }
    load();
  }, [id]);

  function handleAddToCart() {
    if (!selectedSize || !product) return;
    addItem(
      {
        id: product.id, name: product.name, price: product.price,
        category: product.category, sizes: product.sizes,
        image: product.image_url, description: product.description,
        rating: 5, reviews: 0,
      },
      selectedSize
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-ds-4 sm:px-ds-6 lg:px-ds-8 py-ds-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-ds-12 animate-pulse">
          <div className="aspect-[3/4] bg-surface-item rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-surface-item rounded w-1/4" />
            <div className="h-8 bg-surface-item rounded w-3/4" />
            <div className="h-6 bg-surface-item rounded w-1/4" />
            <div className="h-24 bg-surface-item rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-ds-4 py-24 text-center">
        <h1 className="font-gilroy font-bold text-h2 text-content-primary mb-4">Product not found</h1>
        <Link href="/home"><Button>Back to Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-ds-4 sm:px-ds-6 lg:px-ds-8 py-ds-10">
      <nav className="flex items-center gap-2 text-small font-gilroy text-content-secondary mb-ds-8">
        <Link href="/home" className="hover:text-brand-primary transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-content-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-ds-12">
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-item rounded-xl">
          <Image src={product.image_url} alt={product.name} fill priority className="object-cover" />
          {product.stock < 5 && product.stock > 0 && (
            <div className="absolute top-4 left-4"><Badge variant="warning">Low Stock</Badge></div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-4 left-4"><Badge variant="neutral">Sold Out</Badge></div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-small font-gilroy font-medium text-content-secondary uppercase tracking-widest mb-2">
            {product.category}
          </p>
          <h1 className="font-gilroy font-bold text-h2 text-content-primary mb-ds-4 leading-tight">
            {product.name}
          </h1>
          <span className="font-gilroy font-bold text-h2 text-content-primary mb-ds-6">
            ${product.price.toFixed(2)}
          </span>
          <p className="font-gilroy text-body text-content-secondary leading-relaxed mb-ds-8">
            {product.description}
          </p>

          <div className="mb-ds-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-gilroy font-semibold text-small text-content-primary uppercase tracking-widest">
                Select Size
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={[
                    "min-w-[48px] h-11 px-3 border rounded-md font-gilroy font-medium text-body transition-all",
                    selectedSize === size
                      ? "bg-brand-primary text-content-inverse border-brand-primary"
                      : "border-stroke-default text-content-primary hover:border-brand-primary hover:text-brand-primary",
                  ].join(" ")}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" fullWidth onClick={handleAddToCart} disabled={!selectedSize || product.stock === 0}>
              {added ? "Added to Cart" : product.stock === 0 ? "Sold Out" : "Add to Cart"}
            </Button>
            <Link href="/cart" className="sm:w-auto">
              <Button size="lg" variant="secondary" fullWidth>View Cart</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-ds-4 mt-ds-8 pt-ds-8 border-t border-stroke-default">
            {[
              { label: "Free shipping over $150" },
              { label: "30-day easy returns" },
              { label: "Secure payment" },
              { label: "Premium quality" },
            ].map((perk) => (
              <div key={perk.label} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                <span className="text-small font-gilroy text-content-secondary">{perk.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
