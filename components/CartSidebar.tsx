'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--card-bg)] shadow-xl z-50 flex flex-col border-l border-[color:var(--border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--border)]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Shopping Cart ({getTotalItems()})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[color:var(--background)] rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[color:var(--muted)]">
              <ShoppingBag className="w-16 h-16 mb-4 text-[color:var(--border)]" />
              <p className="text-lg">Your cart is empty</p>
              <p className="text-sm mt-2">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg p-3 flex gap-3 border border-[color:var(--border)]"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-[color:var(--border)] rounded flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-[color:var(--muted)]" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-[color:var(--muted)] capitalize">
                      {item.selected_price_type} price
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.cart_quantity - 1)}
                          className="p-1 bg-[var(--card-bg)] rounded hover:bg-[color:var(--background)] transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.cart_quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cart_quantity + 1)}
                          disabled={item.cart_quantity >= item.quantity}
                          className="p-1 bg-[var(--card-bg)] rounded hover:bg-[color:var(--background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-sm">
                          {process.env.NEXT_PUBLIC_CURRENCY}{' '}
                          {(
                            (item.selected_price_type === 'retail'
                              ? item.retail_price
                              : item.wholesale_price) * item.cart_quantity
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.cart_quantity >= item.quantity && (
                      <p className="text-xs text-orange-600 mt-1">
                        Max stock reached ({item.quantity} available)
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 border-[color:var(--border)]">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>
                {process.env.NEXT_PUBLIC_CURRENCY} {getTotalPrice().toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => {
                setIsCheckoutOpen(true);
                onClose();
              }}
              className="w-full btn-primary py-3 rounded-lg font-semibold hover:opacity-90 transition-colors"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={onClose}
              className="w-full bg-[color:var(--background)] text-[color:var(--foreground)] py-2 rounded-lg font-semibold hover:opacity-90 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}


