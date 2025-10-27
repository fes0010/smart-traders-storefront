import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from './supabase';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, priceType: 'retail' | 'wholesale') => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, priceType) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, cart_quantity: item.cart_quantity + 1 }
                : item
            ),
          });
        } else {
          const cartItem: CartItem = {
            ...product,
            cart_quantity: 1,
            selected_price_type: priceType,
          };
          set({ items: [...items, cartItem] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === productId
              ? { ...item, cart_quantity: Math.min(quantity, item.quantity) }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cart_quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price =
            item.selected_price_type === 'retail'
              ? item.retail_price
              : item.wholesale_price;
          return total + price * item.cart_quantity;
        }, 0);
      },
    }),
    {
      name: 'smart-traders-cart',
    }
  )
);

