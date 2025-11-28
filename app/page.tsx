'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { useCartStore } from '@/lib/cart-store';
import { findSuggestions } from '@/lib/fuzzy-search';
import { ShoppingCart, Search, Filter, Zap, Sparkles, ChevronDown, Truck, HelpCircle, X, Phone } from 'lucide-react';
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
  const [showGuide, setShowGuide] = useState(false);

  const { getTotalItems } = useCartStore();

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const hasMore = currentPage < totalPages;

  // Get product names for fuzzy search
  const productNames = useMemo(() => products.map(p => p.name), [products]);

  // Get fuzzy search suggestions when no results found
  const suggestions = useMemo(() => {
    if (filteredProducts.length === 0 && searchTerm.length >= 2) {
      return findSuggestions(searchTerm, productNames, categories);
    }
    return [];
  }, [filteredProducts.length, searchTerm, productNames, categories]);

  // Update displayed products when page or filtered products change
  useEffect(() => {
    const endIndex = currentPage * PRODUCTS_PER_PAGE;
    setDisplayedProducts(filteredProducts.slice(0, endIndex));
  }, [currentPage, filteredProducts]);

  // Lock body scroll when guide modal is open
  useEffect(() => {
    if (showGuide) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showGuide]);

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

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
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

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowGuide(true)}
                className="p-2 sm:p-3 rounded-xl bg-[var(--card-bg)] border border-[color:var(--border)] text-[color:var(--foreground)] hover:border-[color:var(--primary)] transition-all"
                title="How to order"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
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
            <p className="text-white/80 text-sm sm:text-base mb-4">
              Discover amazing products at great prices. Browse our collection and find what you need.
            </p>
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 w-fit">
              <Truck className="w-5 h-5" />
              <span className="text-sm font-medium">🎉 FREE delivery within Kagio Town!</span>
            </div>
          </div>
        </div>
      )}


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl sm:rounded-2xl p-2 sm:p-4 card">
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
            <p className="text-[color:var(--foreground)] text-xl font-semibold mb-2">No products found for "{searchTerm}"</p>
            <p className="text-[color:var(--muted)] mb-4">Try adjusting your search or filter</p>
            
            {/* Fuzzy Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-6">
                <p className="text-[color:var(--muted)] mb-3">Did you mean?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 bg-[color:var(--accent)] border border-[color:var(--border)] rounded-xl text-[color:var(--foreground)] hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-[color:var(--on-primary)] transition-all font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-2 btn-primary rounded-xl"
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
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[color:var(--muted)]">
              © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_STORE_NAME || 'Smart Traders Store'}. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-sm text-[color:var(--success)]">
                <Truck className="w-4 h-4" />
                <span>Free delivery within Kagio Town</span>
              </div>
              <a 
                href="tel:0711489639" 
                className="flex items-center gap-2 text-sm text-[color:var(--primary)] hover:underline"
              >
                <Phone className="w-4 h-4" />
                <span>Call John: 0711489639</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* How to Order Guide Modal */}
      {showGuide && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setShowGuide(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--card-bg)] text-[color:var(--foreground)] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[color:var(--border)]">
              <div className="flex items-center justify-between p-5 border-b border-[color:var(--border)] sticky top-0 bg-[var(--card-bg)] rounded-t-2xl">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-[color:var(--primary)]" />
                  How to Order
                </h2>
                <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-[color:var(--accent)] rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Browse Products</h3>
                    <p className="text-sm text-[color:var(--muted)]">
                      Scroll through our products or use the search bar to find what you need. You can also filter by category.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Add to Cart</h3>
                    <p className="text-sm text-[color:var(--muted)]">
                      Click the cart icon on any product to add it to your shopping cart. You can add multiple items.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Review Your Cart</h3>
                    <p className="text-sm text-[color:var(--muted)]">
                      Click the cart icon in the header to view your items. Adjust quantities or remove items as needed.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Checkout</h3>
                    <p className="text-sm text-[color:var(--muted)]">
                      Click "Proceed to Checkout" and fill in your details: name, phone number, and delivery address.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full hero-gradient text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div>
                    <h3 className="font-semibold mb-1">Place Order</h3>
                    <p className="text-sm text-[color:var(--muted)]">
                      Choose your payment method and click "Place Order". You'll receive an order code to track your order.
                    </p>
                  </div>
                </div>

                {/* Free Delivery Notice */}
                <div className="bg-[color:var(--accent)] rounded-xl p-4 border border-[color:var(--border)]">
                  <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 text-[color:var(--success)]" />
                    <div>
                      <h3 className="font-semibold text-[color:var(--success)]">Free Delivery!</h3>
                      <p className="text-sm text-[color:var(--muted)]">
                        Enjoy FREE delivery for all orders within Kagio Town. Orders outside Kagio may have delivery charges.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                {/* Contact Info */}
                <div className="text-center pt-2">
                  <p className="text-sm text-[color:var(--muted)] mb-3">
                    Need help? Contact us for assistance with your order.
                  </p>
                  <a 
                    href="tel:0711489639" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--accent)] border border-[color:var(--border)] rounded-xl text-[color:var(--primary)] hover:border-[color:var(--primary)] transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Call John: 0711489639</span>
                  </a>
                </div>

                <button
                  onClick={() => setShowGuide(false)}
                  className="w-full btn-primary py-3 rounded-xl font-semibold"
                >
                  Got it, let's shop!
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
