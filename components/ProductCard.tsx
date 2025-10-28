'use client';

import { useState } from 'react';
import { Product } from '@/lib/supabase';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart, Package, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedPriceType, setSelectedPriceType] = useState<'retail' | 'wholesale'>('retail');
  const { addItem } = useCartStore();

  const price = selectedPriceType === 'retail' ? product.retail_price : product.wholesale_price;
  const isLowStock = product.quantity <= product.min_stock_level;
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addItem(product, selectedPriceType);
    }
  };

  return (
    <div className="rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden card">
      {/* Product Image */}
      <div className="relative h-48 bg-[color:var(--background)] flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-16 h-16 text-gray-300" />
        )}

        {/* Stock Badges */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            OUT OF STOCK
          </div>
        )}
        {!isOutOfStock && isLowStock && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            LOW STOCK
          </div>
        )}

        {/* SKU Badge */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          {product.sku}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          {product.category && (
            <span className="text-xs text-[color:var(--muted)] uppercase tracking-wide">
              {product.category}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-[color:var(--muted)] mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Stock Info */}
        {process.env.NEXT_PUBLIC_SHOW_STOCK_COUNT === 'true' && !isOutOfStock && (
          <div className="text-sm text-[color:var(--muted)] mb-3 flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>{product.quantity} in stock</span>
          </div>
        )}

        {/* Price Type Selector */}
        {product.selling_mode === 'both' && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSelectedPriceType('retail')}
              className={`flex-1 text-xs py-1 px-2 rounded transition-colors ${
                selectedPriceType === 'retail'
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'bg-[color:var(--background)] text-[color:var(--muted)] hover:opacity-90'
              }`}
            >
              Retail
            </button>
            <button
              onClick={() => setSelectedPriceType('wholesale')}
              className={`flex-1 text-xs py-1 px-2 rounded transition-colors ${
                selectedPriceType === 'wholesale'
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'bg-[color:var(--background)] text-[color:var(--muted)] hover:opacity-90'
              }`}
            >
              Wholesale
            </button>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">
              {process.env.NEXT_PUBLIC_CURRENCY} {price.toFixed(2)}
            </div>
            {product.selling_mode === 'both' && (
              <div className="text-xs text-[color:var(--muted)]">
                {selectedPriceType === 'retail' ? 'Retail' : 'Wholesale'} price
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-3 rounded-full transition-all ${
              isOutOfStock
                ? 'bg-[color:var(--border)] text-[color:var(--muted)] cursor-not-allowed'
                : 'bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}


