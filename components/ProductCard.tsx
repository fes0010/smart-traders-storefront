'use client';

import { useState } from 'react';
import { Product } from '@/lib/supabase';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart, Package, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedPriceType, setSelectedPriceType] = useState<'retail' | 'wholesale'>('retail');
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();

  const price = selectedPriceType === 'retail' ? product.retail_price : product.wholesale_price;

  const handleAddToCart = () => {
    addItem(product, selectedPriceType);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group rounded-xl sm:rounded-2xl overflow-hidden card">
      {/* Product Image */}
      <div className="relative h-28 sm:h-44 lg:h-52 bg-[color:var(--accent)] flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-10 sm:w-16 h-10 sm:h-16 text-[color:var(--muted)]" />
        )}

        {/* SKU Badge - hidden on mobile */}
        <div className="hidden sm:block absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-lg backdrop-blur-sm">
          {product.sku}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-2 sm:p-4">
        {product.category && (
          <span className="hidden sm:inline text-xs text-[color:var(--primary)] font-medium uppercase tracking-wider">
            {product.category}
          </span>
        )}

        <h3 className="text-xs sm:text-base font-semibold text-[color:var(--foreground)] sm:mt-1 mb-1 sm:mb-2 line-clamp-2 min-h-[2rem] sm:min-h-[3rem]">
          {product.name}
        </h3>

        {/* Description - hidden on mobile */}
        {product.description && (
          <p className="hidden sm:block text-sm text-[color:var(--muted)] mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Price Type Selector - compact on mobile */}
        {product.selling_mode === 'both' && (
          <div className="flex gap-1 sm:gap-2 mb-2 sm:mb-3">
            <button
              onClick={() => setSelectedPriceType('retail')}
              className={`flex-1 text-[10px] sm:text-xs py-1 sm:py-2 px-1 sm:px-3 rounded-md sm:rounded-lg font-medium transition-all ${
                selectedPriceType === 'retail'
                  ? 'btn-primary'
                  : 'bg-[color:var(--accent)] text-[color:var(--muted)]'
              }`}
            >
              Retail
            </button>
            <button
              onClick={() => setSelectedPriceType('wholesale')}
              className={`flex-1 text-[10px] sm:text-xs py-1 sm:py-2 px-1 sm:px-3 rounded-md sm:rounded-lg font-medium transition-all ${
                selectedPriceType === 'wholesale'
                  ? 'btn-primary'
                  : 'bg-[color:var(--accent)] text-[color:var(--muted)]'
              }`}
            >
              Wholesale
            </button>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-[color:var(--border)]">
          <div>
            <div className="text-sm sm:text-xl font-bold text-[color:var(--foreground)]">
              <span className="text-[10px] sm:text-sm">{process.env.NEXT_PUBLIC_CURRENCY}</span> {price.toFixed(0)}
            </div>
            {product.selling_mode === 'both' && (
              <div className="hidden sm:block text-xs text-[color:var(--muted)]">
                {selectedPriceType === 'retail' ? 'Retail' : 'Wholesale'}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all active:scale-95 ${
              isAdded
                ? 'bg-[color:var(--success)] text-white'
                : 'btn-primary'
            }`}
          >
            {isAdded ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
