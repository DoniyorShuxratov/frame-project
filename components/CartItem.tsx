"use client";

import Image from "next/image";
import { CartItem as CartItemType } from "@/lib/types";
import { useCartStore } from "@/lib/store";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-ds-4 py-ds-5 border-b border-stroke-default">
      {/* Thumbnail */}
      <div className="relative w-20 h-24 flex-shrink-0 bg-surface-item rounded-lg overflow-hidden">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-xs text-content-secondary font-gilroy uppercase tracking-widest">
              {item.product.category}
            </p>
            <h4 className="text-body font-gilroy font-semibold text-content-primary mt-0.5 leading-snug">
              {item.product.name}
            </h4>
            <p className="text-small text-content-secondary mt-1">
              Size: <span className="font-semibold text-content-primary">{item.size}</span>
            </p>
          </div>
          <button
            onClick={() => removeItem(item.product.id, item.size)}
            className="text-content-secondary hover:text-error transition-colors flex-shrink-0"
            aria-label="Remove item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Qty stepper */}
          <div className="flex items-center border border-stroke-default rounded-md overflow-hidden">
            <button
              className="w-8 h-8 flex items-center justify-center text-content-primary hover:bg-surface-item transition-colors text-body font-semibold"
              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
            >
              −
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-body font-gilroy font-semibold text-content-primary border-x border-stroke-default">
              {item.quantity}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center text-content-primary hover:bg-surface-item transition-colors text-body font-semibold"
              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
            >
              +
            </button>
          </div>
          <span className="text-h5 font-gilroy font-bold text-content-primary">
            ${(item.product.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
