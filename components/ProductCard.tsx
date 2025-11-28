'use client';

import { useState } from 'react';
import { Product } from '@/lib/supabase';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart, Package, Check, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedPriceType, setSelectedPriceType] = useState<'retail' | 'wholesale'>('retail');
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();

  const price = selectedPriceType === 'retail' ? product.retail_price : product.wholesale_price;
  const isLowStock = product.quantity <= product.min_stock_level && product.quantity > 0;
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedPriceType);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group rounded-2xl overflow-hidden card">
      {/* Product Image */}
      <div className="relative h-52 bg-[color:var(--accent)] flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-16 h-16 text-[color:var(--muted)]" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isLowStock && (
            <span className="badge badge-warning">
              <Sparkles className="w-3 h-3 mr-1" />
              Low Stock
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
              Out of Stock
            </span>
          )}
        </div>

        {/* SKU Badge */}
        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm">
          {product.sku}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        {product.category && (
          <span className="text-xs text-[color:var(--primary)] font-medium uppercase tracking-wider">
            {product.category}
          </span>
        )}

        <h3 className="text-lg font-semibold text-[color:var(--foreground)] mt-1 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-[color:var(--muted)] mb-4 line-clamp-2">{product.description}</p>
        )}

        {/* Price Type Selector */}
        {product.selling_mode === 'both' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedPriceType('retail')}
              className={`flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-all ${
                selectedPriceType === 'retail'
                  ? 'btn-primary'
                  : 'bg-[color:var(--accent)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              Retail
            </button>
            <button
              onClick={() => setSelectedPriceType('wholesale')}
              className={`flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-all ${
                selectedPriceType === 'wholesale'
                  ? 'btn-primary'
                  : 'bg-[color:var(--accent)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              Wholesale
            </button>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-[color:var(--border)]">
          <div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">
              {process.env.NEXT_PUBLIC_CURRENCY} {price.toFixed(2)}
            </div>
            {product.selling_mode === 'both' && (
              <div className="text-xs text-[color:var(--muted)]">
                {selectedPriceType === 'retail' ? 'Retail' : 'Wholesale'} price
              </div>
            )}
            {product.quantity > 0 && (
              <div className="text-xs text-[color:var(--muted)] mt-1">
                {product.quantity} in stock
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-3.5 rounded-xl transition-all active:scale-95 ${
              isAdded
                ? 'bg-[color:var(--success)] text-white'
                : isOutOfStock
                ? 'bg-[color:var(--accent)] text-[color:var(--muted)] cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isAdded ? (
              <Check className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
