'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart, Search, Filter, Zap, Sparkles, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import CheckoutModal from '@/components/CheckoutModal';
import ThemeToggle from '@/components/ThemeToggle';

const PRODUCTS_PER_PAGE = 21;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { getTotalItems } = useCartStore();

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const hasMore = currentPage < totalPages;

  // Update displayed products when page or filtered products change
  useEffect(() => {
    const endIndex = currentPage * PRODUCTS_PER_PAGE;
    setDisplayedProducts(filteredProducts.slice(0, endIndex));
  }, [currentPage, filteredProducts]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore]);

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
        { event: '*', schema: 'public', table: 'products' },
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

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search)
      );
    }

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

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Hero Header */}
      <header className="sticky top-0 z-40 glass border-b border-[color:var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[color:var(--foreground)]">
                  {process.env.NEXT_PUBLIC_STORE_NAME || 'Smart Traders Store'}
                </h1>
                {realtimeStatus === 'connected' && (
                  <span className="flex items-center text-xs text-[color:var(--success)]">
                    <Zap className="w-3 h-3 mr-1" />
                    Live updates
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 rounded-xl bg-[var(--card-bg)] border border-[color:var(--border)] text-[color:var(--foreground)] hover:border-[color:var(--primary)] transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 btn-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[color:var(--muted)] w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[color:var(--muted)]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)] text-[color:var(--foreground)] min-w-[160px]"
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


      {/* Welcome Banner */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="hero-gradient rounded-2xl p-6 sm:p-8 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to our store! 👋</h2>
            <p className="text-white/80 text-sm sm:text-base">
              Discover amazing products at great prices. Browse our collection and find what you need.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl p-4 card">
                <div className="h-48 rounded-xl mb-4 skeleton"></div>
                <div className="h-4 rounded mb-2 skeleton"></div>
                <div className="h-4 rounded w-2/3 skeleton"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[color:var(--accent)] flex items-center justify-center">
              <Search className="w-10 h-10 text-[color:var(--muted)]" />
            </div>
            <p className="text-[color:var(--foreground)] text-xl font-semibold mb-2">No products found</p>
            <p className="text-[color:var(--muted)]">Try adjusting your search or filter</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-6 py-2 btn-primary rounded-xl"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-[color:var(--muted)]">
                Showing {displayedProducts.length} of {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 btn-primary rounded-xl disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      Load More Products
                    </>
                  )}
                </button>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {filteredProducts.length - displayedProducts.length} more products available
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[color:var(--border)] py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[color:var(--muted)]">
            © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_STORE_NAME || 'Smart Traders Store'}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
