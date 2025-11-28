'use client';

import { useCartStore } from '@/lib/cart-store';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();

  return (
    <>
      {/* Light transparent backdrop - products still visible */}
      <div
        className={`fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-[var(--card-bg)] shadow-2xl z-50 flex flex-col border-l border-[color:var(--border)] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[color:var(--border)]">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span>Cart ({getTotalItems()})</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[color:var(--accent)] rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[color:var(--muted)]">
              <div className="w-20 h-20 rounded-full bg-[color:var(--accent)] flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-[color:var(--muted)]" />
              </div>
              <p className="text-lg font-medium text-[color:var(--foreground)]">Your cart is empty</p>
              <p className="text-sm mt-2">Add some products to get started</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 btn-primary rounded-xl"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl p-4 flex gap-4 border border-[color:var(--border)] bg-[color:var(--accent)] hover:border-[color:var(--primary)] transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-[var(--card-bg)] rounded-xl flex-shrink-0 overflow-hidden border border-[color:var(--border)]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-[color:var(--muted)]" />
                      </div>
                    )}
                  </div>


                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate text-[color:var(--foreground)]">{item.name}</h3>
                    <p className="text-xs text-[color:var(--muted)] capitalize mt-0.5">
                      {item.selected_price_type} price
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-[var(--card-bg)] rounded-lg border border-[color:var(--border)]">
                        <button
                          onClick={() => updateQuantity(item.id, item.cart_quantity - 1)}
                          className="p-2 hover:bg-[color:var(--accent)] rounded-l-lg transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">
                          {item.cart_quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cart_quantity + 1)}
                          className="p-2 hover:bg-[color:var(--accent)] rounded-r-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-sm text-[color:var(--foreground)]">
                          {process.env.NEXT_PUBLIC_CURRENCY}{' '}
                          {(
                            (item.selected_price_type === 'retail'
                              ? item.retail_price
                              : item.wholesale_price) * item.cart_quantity
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
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
          <div className="border-t p-5 space-y-4 border-[color:var(--border)] bg-[color:var(--accent)]">
            <div className="flex justify-between items-center">
              <span className="text-[color:var(--muted)]">Subtotal</span>
              <span className="text-lg font-bold text-[color:var(--foreground)]">
                {process.env.NEXT_PUBLIC_CURRENCY} {getTotalPrice().toFixed(2)}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full btn-primary py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="w-full bg-[var(--card-bg)] border border-[color:var(--border)] text-[color:var(--foreground)] py-3 rounded-xl font-medium hover:border-[color:var(--primary)] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
