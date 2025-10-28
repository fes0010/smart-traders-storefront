'use client';

import { useEffect, useState } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart, Search, Filter, Zap } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');

  const { getTotalItems } = useCartStore();

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('products-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => [...prev, payload.new as Product]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Product) : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
          console.log('✅ Real-time connected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter products when search or category changes
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search)
      );
    }

    // Only show active products with retail or both selling mode
    filtered = filtered.filter(
      (p) => p.status === 'active' && (p.selling_mode === 'retail' || p.selling_mode === 'both')
    );

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  // Extract unique categories
  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ) as string[];
    setCategories(uniqueCategories);
  }, [products]);

  async function fetchProducts() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .in('selling_mode', ['retail', 'both'])
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[var(--card-bg)] shadow-sm sticky top-0 z-40 border-b border-[color:var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
                {process.env.NEXT_PUBLIC_STORE_NAME || 'Smart Traders Store'}
              </h1>
              {realtimeStatus === 'connected' && (
                <span className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3 mr-1" />
                  Live
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-[var(--on-primary)] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--muted)] w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)] text-[color:var(--foreground)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[color:var(--muted)]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)] text-[color:var(--foreground)]"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-lg shadow-sm p-4 animate-pulse card">
                <div className="h-48 rounded-lg mb-4 bg-[color:var(--border)]"></div>
                <div className="h-4 rounded mb-2 bg-[color:var(--border)]"></div>
                <div className="h-4 rounded w-2/3 bg-[color:var(--border)]"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[color:var(--muted)] text-lg">No products found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-[color:var(--primary)] hover:opacity-90"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-[color:var(--muted)]">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
