"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { Badge } from "./Badge";
import { useCartStore } from "@/lib/store";

interface ProductCardProps {
  product: Product;
}

const badgeVariantMap: Record<string, "default" | "warning" | "error" | "info"> = {
  Bestseller: "default",
  New:        "info",
  Sale:       "error",
};

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product, product.sizes[0]);
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-surface-card border border-stroke-default rounded-xl transition-shadow duration-300 hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-surface-item">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <div className="absolute top-3 left-3">
              <Badge variant={badgeVariantMap[product.badge] ?? "default"}>
                {product.badge}
              </Badge>
            </div>
          )}
          {/* Quick-add overlay */}
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-0 left-0 right-0 bg-brand-primary text-content-inverse font-gilroy font-semibold text-small py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            Quick Add — {product.sizes[0]}
          </button>
        </div>

        {/* Info */}
        <div className="p-ds-4">
          <p className="text-xs text-content-secondary font-gilroy uppercase tracking-widest mb-1">
            {product.category}
          </p>
          <h3 className="text-body font-gilroy font-semibold text-content-primary leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-h5 font-gilroy font-bold text-content-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-small text-content-secondary line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {/* Stars */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-warning" : "text-stroke-default"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-content-secondary">({product.reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
